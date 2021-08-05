using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dasync.Collections;
using Framework.Events;
using Framework.Projection;
using Framework.Providers;
using MongoDB.Bson;

namespace Framework.Domain
{
    public interface IRepository<TAggregate> where
        TAggregate : IAggregateRoot
    {
        Task SaveAsync(TAggregate aggregate, CancellationToken cancellationToken = default);
        Task ForceSaveAsync(TAggregate aggregate, CancellationToken cancellationToken = default);
        Task<TAggregate> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default);
        Task<IEnumerable<ObjectId>> GetAllIds();
    }

    public class Repository<TAggregate> : IRepository<TAggregate> where
        TAggregate : AggregateRoot, IAggregateRoot, new()
    {
        private readonly IEventStorage _eventStorage;
        private readonly IEnumerable<IProjectionStorage<TAggregate>> _projectionStorages;
        private readonly IEnumerable<IEventPublisher<TAggregate>> _eventPublishers;
        private readonly IUserContextProvider _userContextProvider;

        public Repository(IEventStorage eventStorage, IEnumerable<IProjectionStorage<TAggregate>> projectionStorages,
            IEnumerable<IEventPublisher<TAggregate>> eventPublishers, IUserContextProvider userContext)
        {
            _eventStorage = eventStorage;
            _projectionStorages = projectionStorages;
            _eventPublishers = eventPublishers;
            _userContextProvider = userContext;
        }

        public async Task SaveAsync(TAggregate aggregate, CancellationToken cancellationToken = default)
        {
            if (aggregate.HasUncommittedChanges)
            {
                await CommitChanges(aggregate);
            }
        }
        
        public async Task ForceSaveAsync(TAggregate aggregate, CancellationToken cancellationToken = default)
        {
            await CommitChanges(aggregate);
        }

        public async Task<TAggregate> GetByIdAsync(ObjectId id, CancellationToken cancellationToken = default)
        {
            var aggregate = new TAggregate();
            aggregate.Id = id;

            // fixme: read from snapshots later

            var events = await _eventStorage.GetEventsAsync(id, 0, int.MaxValue);

            if (!events.Any())
            {
                throw new AggregateNotFoundException($"No events found for aggregate with id={id}");
            }

            aggregate.Load(events);

            return aggregate;
        }

        public async Task<IEnumerable<ObjectId>> GetAllIds()
        {
            return await _eventStorage.GetAllAggregateIds();
        }

        private async Task CommitChanges(TAggregate aggregate)
        {
            var changesToCommit = aggregate.GetUncommittedChanges()
                .ToList();

            // PreCommit(changesToCommit);

            var events = changesToCommit.Select(ev => new Event
            {
                AggregateId = aggregate.Id,
                CorrelationId = "", // fixme
                Timestamp = DateTime.UtcNow,
                Payload = ev.Payload,
                EventName = ev.Payload.GetType().Name,
                EventVersion = ev.Version,
                UserId = _userContextProvider.GetUserContext().UserId,
                UserName = _userContextProvider.GetUserContext().UserName
            }).ToList();

            if (changesToCommit.Any())
            {
                await _eventStorage.SaveEventsAsync(events);
            }

            var allEvents = await _eventStorage.GetEventsAsync(aggregate.Id, 0, int.MaxValue);

            // not implemented
            // await SaveSnapshotAsync();

            await SaveProjections(aggregate, allEvents);
            await PublishEventsAsync(aggregate, events);

            aggregate.MarkChangesAsCommitted();
        }

        private async Task SaveProjections(TAggregate aggregate, IEnumerable<Event> events)
        {
            if (!_projectionStorages.Any())
            {
                return;
            }

            await _projectionStorages.ParallelForEachAsync(async storage =>
            {
                await storage.SaveProjection(aggregate, events);
            });
        }

        private async Task PublishEventsAsync(TAggregate aggregate, List<Event> events)
        {
            if (!_eventPublishers.Any())
            {
                return;
            }

            await _eventPublishers.ParallelForEachAsync(async publisher =>
            {
                foreach (var ev in events)
                {
                    await publisher.PublishAsync(ev, aggregate);
                }
            });
        }


        // private void PreCommit(IEnumerable<IEvent> events)
        // {
        //     foreach (var e in events)
        //     {
        //         // e.CommittedTimestamp = DateTime.UtcNow;
        //     }
        // }
    }

    public class AggregateNotFoundException : Exception
    {
        public AggregateNotFoundException(string s) : base(s)
        {
        }
    }
}