using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantQualityItemStatusClearedEvent
    {
        public string UserId { get; set; }
        public string ConsultantId { get; set; }
        public string Country { get; set; }
        public string QualityItemName { get; set; }
    }
}