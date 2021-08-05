using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.Azure.ServiceBus;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Bonliva.Messaging.Subscriber
{
    public class MessageProcessor
    {
        public Func<Task> CompleteMessageAsync { get; set; }

        private readonly IServiceProvider _serviceProvider;
        private readonly TelemetryClient _telemetryClient;
        private ILogger<MessageProcessor> _logger;
        private readonly IEventHandlerFactory _handlerFactory;

        public MessageProcessor(TelemetryClient telemetryClient, ILogger<MessageProcessor> logger,
            IEventHandlerFactory handlerFactory, IServiceProvider serviceProvider)
        {
            _telemetryClient = telemetryClient;
            _logger = logger;
            _handlerFactory = handlerFactory;
            _serviceProvider = serviceProvider;
        }

        public async Task HandleMessageAsActivity(Message azureMessage, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(azureMessage.CorrelationId))
            {
                await HandleMessage(azureMessage, cancellationToken);
                return;
            }

            var activity = new Activity("MessageSubscriber.HandleMessage");
            activity.SetParentId(azureMessage.CorrelationId);

            using var operation = _telemetryClient.StartOperation<RequestTelemetry>(activity);
            _telemetryClient.TrackTrace("ReceivedMessage", SeverityLevel.Information, new Dictionary<string, string>()
            {
                {"MessageName", azureMessage.UserProperties["Name"]?.ToString() ?? ""},
                {"MessageBody", Encoding.UTF8.GetString(azureMessage.Body)}
            });

            try
            {
                await HandleMessage(azureMessage, cancellationToken);
            }
            catch (Exception e)
            {
                _telemetryClient.TrackException(e);
                operation.Telemetry.Success = false;
                throw;
            }

            _telemetryClient.TrackTrace("Done");
        }

        private async Task HandleMessage(Message azureMessage, CancellationToken cancellationToken)
        {
            var body = Encoding.UTF8.GetString(azureMessage.Body);

            _logger.LogInformation(
                $"Received message: SequenceNumber:{azureMessage.SystemProperties.SequenceNumber} Body:{body}");

            var envelope = JsonConvert.DeserializeObject<MessageEnvelope>(body);
            var messageType = _handlerFactory.GetMessageType(envelope.Name);

            if (messageType == null)
            {
                await CompleteMessageAsync();
                return;
            }

            var message = JsonConvert.DeserializeObject(envelope.Body.ToString(), messageType,
                new JsonSerializerSettings()
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                });

            var handler = _handlerFactory.InstantiateHandler(_serviceProvider, envelope.Name);

            if (handler == null)
            {
                await CompleteMessageAsync();
                return;
            }

            await handler!.Handle(message);
            await CompleteMessageAsync();
        }
    }
}