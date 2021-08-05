using System;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class BookingCreatedEvent
    {
        public string BookingId { get; set; }
        public string BookingGroupId { get; set; }
        public DateTime BookingWeek { get; set; }
        
        public string ConsultantId { get; set; }
        public string ConsultantName { get; set; }
        
        public string WorkRequestId { get; set; }
        
        public string WorkplaceName { get; set; }
        public string WorkplaceId { get; set; }
        
        public string DepartmentName { get; set; }
        public string DepartmentId { get; set; }

        public string UserId { get; set; }
        public string UserName { get; set; }
    }
}