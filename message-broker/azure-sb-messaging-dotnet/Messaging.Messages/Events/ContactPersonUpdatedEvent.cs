using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ContactPersonUpdatedEvent
    {
        public string ContactPersonId { get; set; }
    }
}