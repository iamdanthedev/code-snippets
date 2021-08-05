using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class WorkRequestDeletedEvent
    {
        public string WorkRequestId { get; set; }
    }
}