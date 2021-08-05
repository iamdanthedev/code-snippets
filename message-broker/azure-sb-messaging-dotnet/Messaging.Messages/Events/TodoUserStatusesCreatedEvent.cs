using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoUserStatusesCreatedEvent
    {
        public string TodoId { get; set; }
    }
}