using System.Threading.Tasks;
using Domain.Timereport.Projection.TrackingProjection;
using MongoDB.Bson;

namespace Domain.Timereport
{
    public interface ITimereportTrackingProjectionQuery
    {
        Task<TimereportTrackingProjection?> GetByAggregateId(ObjectId aggregateId);
    }
}