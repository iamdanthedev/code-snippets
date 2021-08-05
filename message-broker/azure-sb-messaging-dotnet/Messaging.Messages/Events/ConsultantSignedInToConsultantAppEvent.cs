using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantSignedInToConsultantAppEvent
    {
        public string ConsultantId { get; set; }
        public string ConsultantName { get; set; }
        public bool FirstTime { get; set; }
    }
}