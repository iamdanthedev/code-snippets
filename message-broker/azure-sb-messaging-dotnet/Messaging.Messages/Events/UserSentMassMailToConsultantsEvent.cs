using System.Collections.Generic;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class UserSentMassMailToConsultantsEvent
    {
        public string Subject { get; set; }
        public string Body { get; set; }
        public string UserId { get; set; }
        public IEnumerable<string> ConsultantIds { get; set; }
    }
}