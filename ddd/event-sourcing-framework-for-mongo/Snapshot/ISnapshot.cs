using MongoDB.Bson;

namespace Framework.Snapshot
{
    public interface ISnapshot
    {
        ObjectId Id { get; }
        ObjectId AggregateId { get; }
        int Version { get; }
    }
}