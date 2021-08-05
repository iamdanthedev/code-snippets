using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoEventAddedEvent
    {
        public string TodoId { get; set; }
        public string EventId { get; set; }
    }
}