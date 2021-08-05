using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TimereportApprovedByCustomerEvent
    {
        public string ApprovedBy { get; set; }
        public string ConsultantId { get; set; }
        public string ConsultantName { get; set; }
        public string TimereportId { get; set; }
        public string BookingId { get; set; }
        public int Week { get; set; }
        public int Year { get; set; }
    }
}