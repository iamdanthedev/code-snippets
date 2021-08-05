using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public class BookingCostsModifiedEvent
    {
        public string BookingId { get; set; }
        public string WorkplaceName { get; set; }
        public string ConsultantId { get; set; }
        public string ConsultantName { get; set; }
        public bool IsConsultantPayed { get; set; }

        /// <summary>
        ///     Salary or subcontractor bill
        /// </summary>
        public decimal ConsultantBillTotal { get; set; }
    }
}