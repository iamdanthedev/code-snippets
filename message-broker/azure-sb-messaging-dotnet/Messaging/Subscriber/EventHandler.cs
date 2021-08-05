using System.Threading.Tasks;

namespace Bonliva.Messaging.Subscriber
{
    public abstract class EventHandler
    {
        public abstract Task Handle(object message);
    }

    public abstract class EventHandler<T> : EventHandler where T : class
    {
        public override Task Handle(object message)
        {
            return Handle((T) message);
        }
        
        public abstract Task Handle(T message);
    }
}