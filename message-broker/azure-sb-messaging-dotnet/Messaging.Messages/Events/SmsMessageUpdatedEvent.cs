using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class SmsMessageUpdatedEvent
    {
        public string SmsMessageId { get; set; }
    }
}