using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ContactPersonCreatedEvent
    {
        public string ContactPersonId { get; set; }
        public string UserId { get; set; }
    }
}