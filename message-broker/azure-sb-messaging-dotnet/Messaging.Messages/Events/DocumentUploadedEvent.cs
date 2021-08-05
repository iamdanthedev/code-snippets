using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class DocumentUploadedEvent
    {
        public string FileId { get; set; }
    }
}