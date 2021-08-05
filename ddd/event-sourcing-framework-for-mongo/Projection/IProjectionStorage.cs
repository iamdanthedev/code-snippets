using System.Collections.Generic;
using System.Threading.Tasks;
using Framework.Domain;
using Framework.Events;

namespace Framework.Projection
{
    public interface IProjectionStorage<TAggregate> where TAggregate : IAggregateRoot
    {
        Task SaveProjection(TAggregate aggregate, IEnumerable<Event> events);
    }

    public abstract class ProjectionStorage<TAggregate, TProjection> : IProjectionStorage<TAggregate>
        where TAggregate : IAggregateRoot
        where TProjection : IProjection
    {
        public abstract Task SaveProjection(TAggregate aggregate, IEnumerable<Event> events);
    }
}