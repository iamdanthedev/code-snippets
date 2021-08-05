using System;
using MongoDB.Bson;

namespace Domain.Timereport
{
    public class TimereportDayNotFoundException : Exception
    {
        public TimereportDayNotFoundException(DateTime dayDate) : base($"cannot find day on date {dayDate:yyyy-MM-dd}")
        {
        }
    }

    public class TimereportNotFoundException : Exception
    {
        public TimereportNotFoundException(ObjectId timereportId)
            : base($"Cannot find timereport by id: {timereportId}")
        {
        }
        
        public TimereportNotFoundException(string timereportId)
            : base($"Cannot find timereport by id: {timereportId}")
        {
        }
    }

    public class TimereportNotFoundByBookingIdException : Exception
    {
        public TimereportNotFoundByBookingIdException(ObjectId bookingId)
            : base($"Cannot find timereport by booking id: {bookingId}")
        {
        }
    }
}