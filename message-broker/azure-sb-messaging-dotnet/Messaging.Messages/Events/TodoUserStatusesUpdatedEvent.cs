using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoUserStatusesUpdatedEvent
    {
        public string TodoId { get; set; }
    }
}