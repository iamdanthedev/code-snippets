using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantQualityItemStatusSetEvent
    {
        public string UserId { get; set; }
        public string ConsultantId { get; set; }
        public string Country { get; set; }
        public string QualityItemName { get; set; }
        public string StatusName { get; set; }
        public string Comment { get; set; }
    }
}