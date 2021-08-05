using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public record TodoAddedEvent(string TodoId)
    {
        public string TodoId { get; init; } = TodoId;
    }
}