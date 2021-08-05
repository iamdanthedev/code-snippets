using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Timereport.Aggregate;
using Domain.Timereport.Projection;
using Domain.Timereport.Projection.FullProjection;
using Framework.Domain;
using MongoDB.Bson;
using Util.Time;

namespace Domain.Timereport
{
    public class TimereportService
    {
        private readonly IRepository<TimereportAggregate> _timereportRepository;
        private readonly ITimereportFullProjectionQuery _fullProjectionSearch;

        public TimereportService(IRepository<TimereportAggregate> timereportRepository,
            ITimereportFullProjectionQuery fullProjectionSearch)
        {
            _timereportRepository = timereportRepository;
            _fullProjectionSearch = fullProjectionSearch;
        }

        public async Task<TimereportAggregate> GetAggregateById(string id)
        {
            return await GetAggregateById(ObjectId.Parse(id));
        }

        public async Task<TimereportAggregate> GetAggregateById(ObjectId id)
        {
            return await _timereportRepository.GetByIdAsync(id);
        }

        public async Task<TimereportFullProjection> GetFullProjectionAsync(string timereportId)
        {
            return await GetFullProjectionAsync(ObjectId.Parse(timereportId));
        }

        public async Task<TimereportFullProjection> GetFullProjectionAsync(ObjectId timereportId)
        {
            var projection = await _fullProjectionSearch.GetByAggregateIdAsync(timereportId);

            if (projection == null)
            {
                throw new TimereportNotFoundException(timereportId);
            }

            return projection;
        }

        /// <summary>
        /// Get projection by booking id
        /// </summary>
        /// <param name="bookingId"></param>
        /// <returns></returns>
        /// <exception cref="TimereportNotFoundByBookingIdException"></exception>
        public async Task<TimereportFullProjection> GetFullProjectionByBookingIdAsync(ObjectId bookingId)
        {
            var projection = await _fullProjectionSearch.GetByBookingIdAsync(bookingId);

            if (projection == null)
            {
                throw new TimereportNotFoundByBookingIdException(bookingId);
            }

            return projection;
        }

        public async Task<IEnumerable<TimereportFullProjection>> GetFullProjectionsByWeek(ObjectId consultantId,
            WeekYear weekYear)
        {
            return await _fullProjectionSearch.GetByWeek(consultantId, weekYear);
        }

        public async Task<IEnumerable<TimereportFullProjection>> GetFullProjectionsByConsultantAndPeriod(
            ObjectId consultantId, DateTime from, DateTime to)
        {
            return await _fullProjectionSearch.GetByConsultantAndPeriod(consultantId, from, to);
        }

        public async Task<TimereportAggregate> SaveAsync(TimereportAggregate timereport)
        {
            await _timereportRepository.SaveAsync(timereport);
            return timereport;
        }

        public async Task<IEnumerable<TimereportFullProjection>> GetFullProjectionsByConsultantOnWeek(
            ObjectId consultantId, int week, int year)
        {
            return await _fullProjectionSearch.GetByConsultantOnWeek(consultantId, week, year);
        }

        public async Task<TimereportAggregate?> GetByBookingIdAsync(string bookingId)
        {
            var proj = await _fullProjectionSearch.GetByBookingIdAsync(ObjectId.Parse(bookingId));

            if (proj == null)
            {
                return null;
            }

            return await _timereportRepository.GetByIdAsync(proj.AggregateId);
        }
    }
}