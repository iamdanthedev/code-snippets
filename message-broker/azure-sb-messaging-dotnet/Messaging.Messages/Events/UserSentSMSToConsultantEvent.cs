using System;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class UserSentSmsToConsultantEvent
    {
        public string MessageId { get; set; }
        public DateTime SentOn { get; set; }
        public string ConsultantId { get; set; }
        public string UserId { get; set; }
    }
}