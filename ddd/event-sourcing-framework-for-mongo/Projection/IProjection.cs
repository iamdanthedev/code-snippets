using Framework.Domain;
using MongoDB.Bson;

namespace Framework.Projection
{
    public interface IProjection
    {
        ObjectId AggregateId { get; }
        int AggregateVersion { get; }
    }
}