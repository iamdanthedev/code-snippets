using System;
using System.Threading.Tasks;
using Bonliva.Messaging.Messages.Events;
using Microsoft.Extensions.Logging;

namespace MessagingTest.EventHandlers
{
    public class TodoUserStatusCreatedEventHandler : Bonliva.Messaging.Subscriber.EventHandler<TodoUserStatusesCreatedEvent>
    {
        private readonly ILogger<TodoUserStatusCreatedEventHandler> _logger;

        public TodoUserStatusCreatedEventHandler(ILogger<TodoUserStatusCreatedEventHandler> logger)
        {
            _logger = logger;
        }

        public override Task Handle(TodoUserStatusesCreatedEvent message)
        {
            _logger.LogInformation("handling...");
            throw new Exception("todo user status created event handler failed");
        }
    }
}