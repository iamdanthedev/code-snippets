using System;
using System.Collections.Generic;
using Framework.Projection;
using MongoDB.Bson;

namespace Domain.Timereport.Projection.TrackingProjection
{
    public class TimereportTrackingProjection : IProjection
    {
        public ObjectId AggregateId { get; set; }
        public int AggregateVersion { get; set; }
        
        public TimereportStatus Status { get; set; }
        
        public TimereportOperation CreateOperation { get; set; }
        public TimereportOperation? DraftOperation { get; set; }
        public TimereportOperation? ConsultantSubmitOperation { get; set; }
        public ConsultantPaymentProcessedOperation? ConsultantPaymentProcessedOperation { get; set; }
        public TimereportSentToCustomerOperation? SentToCustomerOperation { get; set; }
        public TimereportReviewOperation? ApprovedByCustomerOperation { get; set; }
        public TimereportReviewOperation? RejectedByCustomerOperation { get; set; }
        
        public TimereportOperation? SentToHbaOperation { get; set; }
        public TimereportOperation? ApprovedByHbaOperation { get; set; }
        public TimereportOperation? RejectedByHbaOperation { get; set; }
        
        public TimereportOperation? SentToFinanceOperation { get; set; }
        public TimereportOperation? ApprovedByFinanceOperation { get; set; }
        public TimereportOperation? RejectedByFinanceOperation { get; set; }
        
        public TimereportOperation? SentToOcOperation { get; set; }
        public TimereportOperation? ApprovedByOcOperation { get; set; }
        public TimereportOperation? RejectedByOcOperation { get; set; }
    }
    
    public class TimereportOperation
    {
        public DateTime DateUtc { get; set; }
        public TimereportTrackingUserRef User { get; set; }
    }

    public class TimereportSentToCustomerOperation : TimereportOperation
    {
        public List<string> ContactPersons { get; set; }
    }

    public class TimereportReviewOperation : TimereportOperation
    {
        public string ContactPerson { get; set; }
    }

    public class ConsultantPaymentProcessedOperation : TimereportOperation
    {
        public decimal ConsultantPaymentTotal { get; set; }
    }

    public class TimereportTrackingUserRef
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}