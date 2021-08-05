using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class WorkRequestPublishedEvent
    {
        public string WorkRequestId { get; set; }
    }
}