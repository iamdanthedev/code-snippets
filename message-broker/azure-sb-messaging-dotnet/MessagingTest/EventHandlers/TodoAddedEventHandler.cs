using System.Threading.Tasks;
using Bonliva.Messaging.Messages.Events;
using Bonliva.Messaging.Publisher;
using Bonliva.Messaging.Subscriber;
using Microsoft.Extensions.Logging;

namespace MessagingTest.EventHandlers
{
    public class TodoAddedEventHandler : EventHandler<TodoAddedEvent>
    {
        private ILogger<TodoAddedEventHandler> _logger;
        private IMessagePublisher _messagePublisher;

        
        public TodoAddedEventHandler(ILogger<TodoAddedEventHandler> logger, IMessagePublisher messagePublisher)
        {
            _logger = logger;
            _messagePublisher = messagePublisher;
        }

        public override async Task Handle(TodoAddedEvent message)
        {
            _logger.LogInformation("Handling event...");

            // await _messagePublisher.PublishAsync(new TodoUserStatusesCreatedEvent()
            // {
            //     TodoId = "qweqweqwe"
            // });
            //
            // await _messagePublisher.PublishAsync(new TodoUserStatusesCreatedEvent()
            // {
            //     TodoId = "qweqweqwe"
            // });
        }
    }
}