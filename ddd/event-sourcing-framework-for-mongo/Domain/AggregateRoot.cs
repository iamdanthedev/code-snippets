using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Framework.Events;
using MongoDB.Bson;

namespace Framework.Domain
{
    public interface IAggregateRoot
    {
        ObjectId Id { get; }
        int Version { get; }
    }

    public abstract class AggregateRoot : IAggregateRoot
    {
        private readonly List<Event> _changes = new();

        public ObjectId Id { get; set; }
        public int Version { get; set; }

        public IEnumerable<Event> GetUncommittedChanges()
        {
            lock (_changes)
            {
                return _changes.ToArray();
            }
        }

        public bool HasUncommittedChanges => _changes.Any();

        public bool HasUncommittedEvent(ObjectId eventId) => _changes.Any(x => x.Id.Equals(eventId));

        public void MarkChangesAsCommitted()
        {
            if (HasUncommittedChanges)
            {
                _changes.Clear();
            }
        }

        public void Load(IEnumerable<Event> history)
        {
            lock (_changes)
            {
                foreach (var ev in history.ToArray())
                {
                    ApplyDynamicEvent(ev);
                    Version++;
                }
            }
        }

        protected void RaiseEvent(object payload)
        {
            var @event = new Event
            {
                Payload = payload
            };

            ApplyEvent(@event);
            _changes.Add(@event);
        }

        protected void ApplyEvent(Event ev)
        {
            if (HasUncommittedEvent(ev.Id))
            {
                return;
            }
            
            ApplyDynamicEvent(ev);
            Version++;
        }

        private void ApplyDynamicEvent(Event ev)
        {
            var type = ev.Payload.GetType();
            var asTyped = typeof(Event).GetMethod("AsTyped")!.MakeGenericMethod(type);
            var typed = asTyped.Invoke(ev, null);

            ((dynamic) this).Apply((dynamic) typed);
            
        }
    }

    public class AggregateInvalidEventException : Exception
    {
    }
}