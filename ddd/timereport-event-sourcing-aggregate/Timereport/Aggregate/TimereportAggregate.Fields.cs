using System;
using System.Collections.Generic;
using System.Linq;
using Domain.Timereport.TimereportSummary;
using Domain.Timereport.Types;
using MongoDB.Bson;
using Util;

namespace Domain.Timereport.Aggregate
{
    public partial class TimereportAggregate
    {
        public bool Active { get; private set; }
        public List<TimereportDay> Days { get; private set; }
        public ObjectId ConsultantId { get; private set; }
        public ObjectId? BookingId { get; private set; }

        public string Workplace { get; private set; }
        public string? WorkplaceId { get; private set; }
        public bool WorkplaceAllowsDigitalReport { get; set; }

        public string? Department { get; private set; }
        public string? DepartmentId { get; private set; }
        public bool DepartmentAllowsDigitalReport { get; set; }

        public DateTime StartsOnUtc { get; private set; }
        public DateTime CreatedOnUtc { get; private set; }
        public List<TimereportStatusRecord> StatusRecords { get; private set; } = new();
        public bool Disabled { get; private set; } = false;

        public TimereportStatus Status => StatusRecords.Last().Status;
        public bool StatusChangedAutomatically { get; set; } = false;

        public DateTime LastStatusChangeUtc => StatusRecords.Last().Date;

        public SentToCustomerTrack SentToCustomerTrack { get; set; } = new();

        public bool Enabled => CustomerAllowsDigitalReport;

        public bool CustomerAllowsDigitalReport => !string.IsNullOrEmpty(Department)
            ? DepartmentAllowsDigitalReport
            : WorkplaceAllowsDigitalReport;

        public int TotalMileage => Days.Sum(x => x.ConsultantMileage);

        public decimal TotalExpenses => Days.Sum(x => x.TotalExpenses);

        public double TotalActiveMinutes => Days.Sum(x => x.TotalActiveMinutes());

        public void SetStatus(DateTime date, TimereportStatus status)
        {
            StatusRecords.Add(new TimereportStatusRecord(date, status));
            StatusRecords = StatusRecords.RemoveSequential().ToList();
        }

        public string? LastCustomerReviewId { get; set; }

        public TimereportStatus? StatusBeforeTheLast
        {
            get
            {
                if (StatusRecords.Count < 2)
                {
                    return null;
                }

                return StatusRecords[^2].Status;
            }
        }
    }

    public record TimereportStatusRecord(DateTime Date, TimereportStatus Status) : IComparable<TimereportStatusRecord>
    {
        public int CompareTo(TimereportStatusRecord? other)
        {
            return Status == other?.Status ? 0 : 1;
        }
    }

    public enum TimereportWorkType
    {
        Work,
        OnCall,
        PreparednessA,
        PreparednessB
    }

    public record TimereportSummaryRecord
    {
        public TimereportWorkType Type { get; init; }
        public double ActiveTimeTotal { get; set; }
        public double PassiveTimeTotal { get; set; }

        public double LunchTimeTotal { get; set; }
        public double SickTimeTotal { get; set; }
        public double VabTimeTotal { get; set; }
    }
}