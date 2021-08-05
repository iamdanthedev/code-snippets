using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;

namespace Framework.Events
{
    public class Event<T> : IEvent
    {
        public ObjectId Id { get; set; } = ObjectId.GenerateNewId();
        public int Version { get; set; }
        public ObjectId AggregateId { get; set; }
        public string CorrelationId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string EventName { get; set; }
        public int EventVersion { get; set; }
        public ObjectId UserId { get; set; }
        public string UserName { get; set; }
        public T Payload { get; set; }
    }

    public class Event : Event<object>
    {
        public Event<T> AsTyped<T>() where T : class
        {
            if (Payload.GetType() != typeof(T))
            {
                throw new InvalidCastException();
            }

            return new Event<T>()
            {
                Id = Id,
                AggregateId = AggregateId,
                CorrelationId = CorrelationId,
                Timestamp = Timestamp,
                EventName = EventName,
                EventVersion = EventVersion,
                UserId = UserId,
                UserName = UserName,
                Payload = (Payload as T)!
            };
        }
    }

    public static class EventExtension
    {
        public static IEnumerable<Event<T>> OfEventType<T>(this IEnumerable<Event> events)
            where T : class
        {
            return events.Where(x => x.Payload.GetType() == typeof(T)).Select(x => x.AsTyped<T>());
        }
    }
}