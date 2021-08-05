using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class BookingCanceledEvent
    {
        public string BookingId { get; set; }
        public string? UserId { get; set; }
    }
}