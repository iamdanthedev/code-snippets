using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class UserSentEmailToConsultantEvent
    {
        public string Subject { get; set; }
        public string Body { get; set; }
        public string ConsultantId { get; set; }
        public string UserId { get; set; }
    }
}