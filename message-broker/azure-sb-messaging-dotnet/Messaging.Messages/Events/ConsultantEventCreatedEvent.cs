using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantEventCreatedEvent
    {
        public string ConsultantId { get; set; }
        public string UserId { get; set; }
        public string EventId { get; set; }
    }
}