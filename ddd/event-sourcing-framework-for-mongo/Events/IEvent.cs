using System;
using MongoDB.Bson;

namespace Framework.Events
{
    public interface IEvent
    {
        ObjectId Id { get; }
        int Version { get; }

        ObjectId AggregateId { get; set; }
        string CorrelationId { get; set; }
        DateTime Timestamp { get; set; }

        string EventName { get; set; }
        int EventVersion { get; set; }

        ObjectId UserId { get; set; }
        string UserName { get; set; }
    }
}