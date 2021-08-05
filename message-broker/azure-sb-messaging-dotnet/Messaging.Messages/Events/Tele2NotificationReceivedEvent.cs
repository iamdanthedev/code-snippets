using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class Tele2NotificationReceivedEvent
    {
        [TsType("any", ImportPath = null)]
        public object Response { get; set; }
    }
}