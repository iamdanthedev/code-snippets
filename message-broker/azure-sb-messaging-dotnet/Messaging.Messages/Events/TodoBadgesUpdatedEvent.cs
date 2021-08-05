using System.Collections.Generic;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoBadgesUpdatedEvent
    {
        public IEnumerable<string> UserIds { get; set; }
    }
}