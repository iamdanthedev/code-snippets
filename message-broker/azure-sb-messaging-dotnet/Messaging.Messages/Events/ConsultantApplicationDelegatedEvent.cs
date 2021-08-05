using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantApplicationDelegatedEvent
    {
        public string ConsultantId { get; set; }
        public string TodoId { get; set; }
        public string DelegatedByUserId { get; set; }
        public string DelegatedToUserId { get; set; }
    }
}