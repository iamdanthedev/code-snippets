using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoUserStatusesRecalculateEvent
    {
        public string UserId { get; set; }
    }
}