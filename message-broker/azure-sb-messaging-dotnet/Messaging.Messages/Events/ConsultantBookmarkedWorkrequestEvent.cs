using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantBookmarkedWorkrequestEvent
    {
        public string ConsultantId { get; set; }
        public string WorkRequestId { get; set; }
        public bool isBookmarked { get; set; }
    }
}