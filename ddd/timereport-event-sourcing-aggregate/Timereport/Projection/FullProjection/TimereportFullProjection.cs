using System;
using System.Collections.Generic;
using Domain.Timereport.Types;
using Framework.Projection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Timereport.Projection.FullProjection
{
    public class TimereportFullProjection : IProjection
    {
        public ObjectId Id { get; set; }
        
        public ObjectId AggregateId { get; set; }
        public int AggregateVersion { get; set; }
        
        public bool Active { get; set; }
        public bool Enabled { get; set; }
        public bool IsAssignedToBooking { get; set; } // timereport was attached to a booking at some pount
        public bool CustomerAllowsDigitalReport { get; set; }
        
        public List<TimereportDay> Days { get; set; }
        public TimereportStatus Status { get; set; }
        public DateTime LastStatusChangeUtc { get; set; }
        public ObjectId ConsultantId { get; set; }
        public ObjectId? BookingId { get; set; }
        public string Workplace { get; set; }
        public string? WorkplaceId { get; set; }
        public string? Department { get; set; }
        public string? DepartmentId { get; set; }
        public DateTime StartsOnUtc { get; set; }
        public int Week { get; set; }
        public int Year { get; set; }
        public int TotalMileage { get; set; }
        public decimal? TotalExpenses { get; set; }
        public double TotalActiveMinutes { get; set; }
        public SentToCustomerTrack SentToCustomerTrack { get; set; }
        
        public DateTime CreatedOnUtc { get; set; }
    }
}