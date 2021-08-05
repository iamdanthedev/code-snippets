using System;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Azure.ServiceBus;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Bonliva.Messaging.Subscriber
{
    public class MessageSubscriberOptions
    {
        [Required]
        public string ConnectionString { get; set; }

        [Required]
        public string TopicName { get; set; }

        [Required]
        public string SubscriptionName { get; set; }
    }

    public class MessageSubscriber
    {
        private readonly ILogger<MessageSubscriber> _logger;
        private readonly ISubscriptionClient _subscriptionClient;
        private readonly IServiceProvider _globalServiceProvider;

        public MessageSubscriber(MessageSubscriberOptions options,
            ILogger<MessageSubscriber> logger,
            IServiceProvider globalServiceProvider)
        {
            _logger = logger;
            _globalServiceProvider = globalServiceProvider;
            _subscriptionClient =
                new SubscriptionClient(options.ConnectionString, options.TopicName, options.SubscriptionName);
        }

        public void Subscribe()
        {
            _subscriptionClient.RegisterMessageHandler(Handle,
                new MessageHandlerOptions(HandleException)
                {
                    AutoComplete = false,
                    MaxConcurrentCalls = 20
                });
        }

        private async Task Handle(Message message, CancellationToken cancellationToken)
        {
            var scope = _globalServiceProvider.CreateScope();
            var processor = scope.ServiceProvider.GetRequiredService<MessageProcessor>();
            var publisherContext = scope.ServiceProvider.GetRequiredService<IMessagePublisherContext>();

            publisherContext.CorrelationId = message.CorrelationId ?? "";

            processor.CompleteMessageAsync = async () =>
            {
                await _subscriptionClient.CompleteAsync(message.SystemProperties.LockToken);
            };
            await processor.HandleMessageAsActivity(message, cancellationToken);
        }


        private Task HandleException(ExceptionReceivedEventArgs arg)
        {
            _logger.LogError(arg.Exception, "Error occurred when processing service bus message", new
            {
                Topic = arg.ExceptionReceivedContext.EntityPath
            });

            return Task.CompletedTask;
        }
    }
}