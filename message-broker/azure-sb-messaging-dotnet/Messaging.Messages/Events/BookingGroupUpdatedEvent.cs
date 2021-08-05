using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class BookingGroupUpdatedEvent
    {
        public string BookingGroupId { get; set; }
        public string ConsultantId { get; set; }
        public string UserId { get; set; }
        public string WorkrequestId { get; set;}
        public bool IsConsultantChanged { get; set; }
        public bool IsCustomerChanged { get; set; }
    }
}