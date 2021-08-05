using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class WebNotificationCreatedEvent
    {
        public string NotificationId { get; set; }
    }
}