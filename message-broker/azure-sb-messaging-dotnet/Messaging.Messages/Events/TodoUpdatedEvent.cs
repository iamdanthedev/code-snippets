using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoUpdatedEvent
    {
        public string TodoId { get; set; }
    }
}