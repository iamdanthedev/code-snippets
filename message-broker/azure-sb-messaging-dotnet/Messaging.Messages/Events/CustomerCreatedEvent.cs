using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class CustomerCreatedEvent
    {
        public string CustomerId { get; set; }
    }
}