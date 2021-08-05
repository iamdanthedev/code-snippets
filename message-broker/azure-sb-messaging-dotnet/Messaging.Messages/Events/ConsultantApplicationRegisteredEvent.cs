using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantApplicationRegisteredEvent
    {
        public string ConsultantId { get; set; }
        public string AreaOfExpertise { get; set; }
        public string Source { get; set; }
    }
}