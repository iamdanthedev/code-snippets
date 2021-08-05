using System.Collections.Generic;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class ContactPersonDeassignedEvent
    {
        public string contactPersonId { get; set; }
        public IEnumerable<string> CustomerIds { get; set; }
    }
}