using System;
using System.Threading.Tasks;
using Bonliva.Messaging.Messages.Events;

namespace MessagingTest.EventHandlers
{
    public class WorkrequestUpdatedEventHandler : Bonliva.Messaging.Subscriber.EventHandler<WorkRequestModifiedEvent>
    {
        public override Task Handle(WorkRequestModifiedEvent message)
        {
            Console.WriteLine($"received {message.WorkRequestId}");
            return Task.CompletedTask;
        }
    }
}