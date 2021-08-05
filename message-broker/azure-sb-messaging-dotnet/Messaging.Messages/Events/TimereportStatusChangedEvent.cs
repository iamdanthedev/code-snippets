using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [ExportTsEnum()]
    public enum TimereportStatus
    {
        Draft,
        SubmittedByConsultant,
        SentToCustomer,
        ApprovedByCustomer,
        RejectedByCustomer,
        ConsultantPaymentProcessed,
        Canceled
    }
    
    [Message]
    [ExportTsClass]
    public class TimereportStatusChangedEvent
    {
        public string TimereportId { get; set; }
        public int Year { get; set; }
        public int Week { get; set; }
        public string Workplace { get; set; }
        public string Department { get; set; }
        public string? BookingId { get; set; }
        public string ConsultantId { get; set; }
        public TimereportStatus Status { get; set; }
        public string CurrentStatus { get; set; }
        public string UserName { get; set; }
        public string UserId { get; set; }
    }
}