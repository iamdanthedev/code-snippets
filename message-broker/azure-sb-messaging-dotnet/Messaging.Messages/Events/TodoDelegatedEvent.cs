using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoDelegatedEvent
    {
        public string TodoId { get; set; }
    }
}