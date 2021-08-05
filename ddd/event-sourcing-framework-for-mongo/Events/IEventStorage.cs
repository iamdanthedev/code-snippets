using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace Framework.Events
{
    public interface IEventStorage
    {
        Task<List<Event>> GetEventsAsync(ObjectId aggregateId, int start, int count);
        Task SaveEventsAsync(IEnumerable<Event> events);
        Task<IEnumerable<ObjectId>> GetAllAggregateIds();
    }
}