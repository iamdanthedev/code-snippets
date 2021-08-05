using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ConsultantDuplicateTriedToRegisterEvent
    {
        public string DuplicateOfConsultantId { get; set; }
        
        [TsType("any", ImportPath = null)]
        public object RegisterParams { get; set; }
    }
}