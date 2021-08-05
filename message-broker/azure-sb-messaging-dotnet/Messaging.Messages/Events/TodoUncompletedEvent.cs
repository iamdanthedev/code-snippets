using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoUncompletedEvent
    {
        public string TodoId { get; set; }
    }
}