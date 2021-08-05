using System.Collections.Generic;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TimereportSentToCustomerEvent
    {
        public string TimereportId { get; set; }
        public string SentByUserId { get; set; }
        public string SentByUserName { get; set; }
        public List<string> ContactPersons { get; set; }
    }
}