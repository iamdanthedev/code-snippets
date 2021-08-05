using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoDeletedEvent
    {
        public string TodoId { get; set; }
    }
}