using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class BookingCostsClearedEvent
    {
        public string BookingId { get; set; }
        public string WorkplaceName { get; set; }
        public string ConsultantId { get; set; }
        public string ConsultantName { get; set; }
    }
}