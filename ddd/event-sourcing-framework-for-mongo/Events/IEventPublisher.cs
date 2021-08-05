using System.Threading.Tasks;
using Framework.Domain;

namespace Framework.Events
{
    public interface IEventPublisher<TAggregate> where TAggregate : AggregateRoot
    {
        Task PublishAsync(Event @event, TAggregate aggregate);
    }
}