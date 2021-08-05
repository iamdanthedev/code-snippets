using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantAppliedForWorkrequestEvent
    {
        public string ConsultantId { get; set; }
        public string ConsultantName { get; set; }
        public string ConsultantComment { get; set; }
        public string Organisation { get; set; }
        public string Workplace { get; set; }
        public string Department { get; set; }
        public string WorkrequestId { get; set; }
        public string WorkrequestCrmUrl { get; set; }
    }
}