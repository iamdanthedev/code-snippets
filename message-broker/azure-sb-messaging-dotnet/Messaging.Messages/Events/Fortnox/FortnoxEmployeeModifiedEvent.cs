using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events.Fortnox
{
    [Message]
    [ExportTsClass]
    public class FortnoxEmployeeModifiedEvent
    {
        public string FortnoxEmployeeId { get; set; }
        
        [TsType("any", ImportPath = null)]
        public object Data { get; set; }
    }
}