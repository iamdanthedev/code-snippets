using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Timereport.Projection;
using Domain.Timereport.Projection.FullProjection;
using MongoDB.Bson;
using Util.Time;

namespace Domain.Timereport
{
    public interface ITimereportFullProjectionQuery
    {
        Task<IEnumerable<ObjectId>> GetUniqAggregateIds();
        Task<TimereportFullProjection?> GetByBookingIdAsync(ObjectId bookingId);
        Task<TimereportFullProjection?> GetByAggregateIdAsync(ObjectId timereportId);
        Task<IEnumerable<TimereportFullProjection>> GetByWeek(ObjectId consultantId, WeekYear weekYear);
        Task<IEnumerable<TimereportFullProjection>> GetByConsultantAndPeriod(ObjectId consultantId, DateTime from,
            DateTime to);
        Task<IEnumerable<TimereportFullProjection>> GetByConsultantOnWeek(ObjectId consultantId, int week, int year);
        Task<IEnumerable<TimereportFullProjection>> GetByCustomerId(string messageCustomerId);
        Task<IEnumerable<TimereportFullProjection>> GetByStatusSetOn(TimereportStatus status, DateRange dateRange);
    }
}