using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class CustomerUpdatedEvent
    {
        public string CustomerId { get; set; }
        public string UserId { get; set; }
    }
}