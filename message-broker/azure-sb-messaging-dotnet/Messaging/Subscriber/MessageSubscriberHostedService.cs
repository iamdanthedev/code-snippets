using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace Bonliva.Messaging.Subscriber
{
    public class MessageSubscriberHostedService : IHostedService
    {
        readonly MessageSubscriber _subscriber;

        public MessageSubscriberHostedService(MessageSubscriber subscriber)
        {
            _subscriber = subscriber;
        }
        
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _subscriber.Subscribe();
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
