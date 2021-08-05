using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoCompletedEvent
    {
        public string TodoId { get; set; }
    }
}