using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class WorkRequestModifiedEvent
    {
        public string WorkRequestId { get; set; }
        
        [TsType("WorkrequestStatus", "./WorkrequestStatus")]
        public WorkrequestStatus Status { get; set; }
        
        public bool IsNew { get; set; }
        
        public bool IsDeleted { get; set; }
    }

    [ExportTsEnum()]
    public enum WorkrequestStatus
    {
        Draft,
        Published,
        Closed
    }
}