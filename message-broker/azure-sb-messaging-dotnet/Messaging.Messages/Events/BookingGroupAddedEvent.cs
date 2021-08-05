using System;
using System.Collections.Generic;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class BookingGroupAddedEvent
    {
        public string BookingGroupId { get; set; }
        public IEnumerable<string> BookingIds { get; set; }
        public IEnumerable<DateTime> BookingWeeks { get; set; }
        public string ConsultantId { get; set; }
        public string ConsultantName { get; set; }
        public string WorkRequestId { get; set; }
        public string WorkplaceName { get; set; }
        public string DepartmentName { get; set; }

        public string UserId { get; set; }
        public string UserName { get; set; }
    }
}