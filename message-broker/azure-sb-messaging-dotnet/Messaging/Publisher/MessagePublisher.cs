using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.ServiceBus;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace Bonliva.Messaging.Publisher
{
    public class MessagePublisherOptions
    {
        [Required]
        public string ConnectionString { get; set; }

        [Required]
        public string TopicName { get; set; }
    }

    public class MessagePublisher : IMessagePublisher
    {
        private readonly ILogger<MessagePublisher> _logger;
        private readonly ITopicClient _topicClient;
        private readonly IMessagePublisherContext _publisherContext;

        public MessagePublisher(MessagePublisherOptions options,
            ILogger<MessagePublisher> logger, IMessagePublisherContext publisherContext)
        {
            _logger = logger;
            _publisherContext = publisherContext;
            _topicClient = new TopicClient(options.ConnectionString, options.TopicName);
        }

        public async Task PublishAsync<T>(T message) where T : class
        {
            var azureMessage = PrepareMessage(message);
            await _topicClient.SendAsync(azureMessage);
        }

        public async Task PublishAsync<T>(List<T> messages) where T : class
        {
            var tasks = messages.Select(PrepareMessage)
                .Select(azureMessage => _topicClient.SendAsync(azureMessage))
                .ToList();
            await Task.WhenAll(tasks);
        }

        private Message PrepareMessage<T>(T message) where T : class
        {
            var type = message.GetType().Name;
            var envelope = MessageEnvelope.Create(type, message);

            var jsonSettings = new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            jsonSettings.Converters.Add(new StringEnumConverter());
            
            var json = JsonConvert.SerializeObject(envelope, jsonSettings);
            var bytes = Encoding.UTF8.GetBytes(json);

            _logger.LogInformation($"Sending out message: {json}");
            return new Message(bytes)
            {
                UserProperties =
                {
                    {"Name", type}
                },
                CorrelationId = _publisherContext.CorrelationId
            };
        }
    }
}