using System.Collections.Generic;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class TodoMarkCompletedAsWatchedEvent
    {
        public IEnumerable<string> TodoIds { get; set; }
    }
}