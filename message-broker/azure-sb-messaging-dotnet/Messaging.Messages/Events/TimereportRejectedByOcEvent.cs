using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TimereportRejectedByOcEvent
    {
        public string TimereportId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
    }
}