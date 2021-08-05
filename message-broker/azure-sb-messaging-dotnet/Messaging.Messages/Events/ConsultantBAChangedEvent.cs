using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantBAChangedEvent
    {
        public string ConsultantId { get; set; }
        public string UserId { get; set; }
    }
}