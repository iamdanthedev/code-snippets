using System.Threading.Tasks;
using Bonliva.Messaging.Messages.Events;
using Bonliva.Messaging.Subscriber;
using Domain.Timereport;
using MongoDB.Bson;

namespace Api.EventHandlers
{
    public class BookingCanceledEventHandler : EventHandler<BookingCanceledEvent>
    {
        private readonly TimereportService _timereportService;

        public BookingCanceledEventHandler(TimereportService timereportService)
        {
            _timereportService = timereportService;
        }

        public override async Task Handle(BookingCanceledEvent message)
        {
            var bookingId = ObjectId.Parse(message.BookingId);

            try
            {
                var projection = await _timereportService.GetFullProjectionByBookingIdAsync(bookingId);
                var timereport = await _timereportService.GetAggregateById(projection.AggregateId);

                timereport.Cancel("booking canceled");

                await _timereportService.SaveAsync(timereport);
            }
            catch (TimereportNotFoundByBookingIdException)
            {
                
            }
        }
    }
}