using System.Collections.Generic;
using System.Linq;
using Domain.Timereport.Types;
using Framework.Domain;
using Framework.Events;
using MoreLinq.Extensions;

namespace Domain.Timereport.Aggregate
{
    public partial class TimereportAggregate : AggregateRoot
    {
        public void Apply(Event<TimereportCreatedPayload> ev)
        {
            Active = true;
            CreatedOnUtc = ev.Payload.CreatedOn;
            ConsultantId = ev.Payload.ConsultantId;
            StartsOnUtc = ev.Payload.WeekDateUtc;
            Workplace = ev.Payload.Workplace;
            Department = ev.Payload.Department;
            Days = new List<TimereportDay>();
            StatusRecords = new List<TimereportStatusRecord>();

            WorkplaceAllowsDigitalReport = true;
            DepartmentAllowsDigitalReport = true;

            SetStatus(ev.Timestamp, TimereportStatus.Blank);

            Enumerable.Range(0, 7)
                .ForEach(dayNum =>
                {
                    var dateTime = GetDateTimeOnDay(dayNum);
                    var day = new TimereportDay(dateTime);
                    Days.Add(day);
                });
        }

        public void Apply(Event<TimereportAssignedToBookingPayload> ev)
        {
            Active = true;
            BookingId = ev.Payload.BookingId;

            Workplace = ev.Payload.Workplace ?? "";
            WorkplaceId = ev.Payload.WorkplaceId;

            Department = ev.Payload.Department ?? "";
            DepartmentId = ev.Payload.DepartmentId;
        }

        public void Apply(Event<TimereportUnassignedFromBookingPayload> ev)
        {
            Active = false;
            BookingId = null;
        }

        public void Apply(Event<TimereportWorkTimeUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].WorkTimeRange = ev.Payload.DayTimeRange;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportSickTimeUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].SickTimeRange = ev.Payload.DayTimeRange;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportVabTimeUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].VabTimeRange = ev.Payload.DayTimeRange;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportLunchMinutesUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].ConsultantLunchMinutes = ev.Payload.Minutes;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportExpensesUpdated> ev)
        {
            Days[ev.Payload.Day].ConsultantExpenses = ev.Payload.Value;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportMileageUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].ConsultantMileage = ev.Payload.Mileage;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportCommentUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].ConsultantComment = ev.Payload.Comment;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportOnCallShiftsUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].OnCallShifts = ev.Payload.Shifts;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportPreparednessAShiftsUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].PreparednessAShifts = ev.Payload.Shifts;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportPreparednessBShiftsUpdatedPayload> ev)
        {
            Days[ev.Payload.Day].PreparednessBShifts = ev.Payload.Shifts;
            MaybeChangeBlankDraftStatus(ev.Timestamp);
        }

        public void Apply(Event<TimereportPaymentProcessedPayload> ev)
        {
            SetStatus(ev.Timestamp, TimereportStatus.ConsultantPaymentProcessed);
        }

        public void Apply(Event<TimereportPaymentClearedPayload> ev)
        {
            if (Status == TimereportStatus.ConsultantPaymentProcessed && StatusBeforeTheLast.HasValue)
            {
                SetStatus(ev.Timestamp, StatusBeforeTheLast.Value);
            }
        }

        public void Apply(Event<TimereportSubmittedByConsultantPayload> ev)
        {
            SetStatus(ev.Timestamp, TimereportStatus.SubmittedByConsultant);
        }

        public void Apply(Event<TimereportCanceledPayload> ev)
        {
            SetStatus(ev.Timestamp, TimereportStatus.Canceled);
        }

        public void Apply(Event<TimereportSentToCustomerPayload> ev)
        {
            SetStatus(ev.Timestamp, TimereportStatus.SentToCustomer);
            SentToCustomerTrack = new SentToCustomerTrack();
        }

        public void Apply(Event<TimereportApprovedByCustomerPayload> ev)
        {
            SetStatus(ev.Timestamp, TimereportStatus.ApprovedByCustomer);
            LastCustomerReviewId = ev.Payload.ReviewId;
        }

        public void Apply(Event<TimereportRejectedByCustomerPayload> ev)
        {
            SetStatus(ev.Timestamp, TimereportStatus.RejectedByCustomer);
            LastCustomerReviewId = ev.Payload.ReviewId;
        }

        public void Apply(Event<TimereportFirstCustomerNotificationIssued> ev)
        {
            SentToCustomerTrack.FirstNotificationIssued = true;
        }

        public void Apply(Event<TimereportSecondCustomerNotificationIssued> ev)
        {
            SentToCustomerTrack.SecondNotificationIssued = true;
        }

        public void Apply(Event<TimereportSentToHba> ev)
        {
        }

        public void Apply(Event<TimereportApprovedByHba> ev)
        {
        }

        public void Apply(Event<TimereportRejectedByHba> ev)
        {
        }

        public void Apply(Event<TimereportSentToFinance> ev)
        {
        }

        public void Apply(Event<TimereportRejectedByFinance> ev)
        {
        }

        public void Apply(Event<TimereportSentToOc> ev)
        {
        }

        public void Apply(Event<TimereportApprovedByOc> ev)
        {
        }

        public void Apply(Event<TimereportRejectedByOc> ev)
        {
        }

        public void Apply(Event<WorkplaceAllowsDigitalReportChangedPayload> ev)
        {
            WorkplaceAllowsDigitalReport = ev.Payload.Allows;
        }

        public void Apply(Event<DepartmentAllowsDigitalReportChangedPayload> ev)
        {
            DepartmentAllowsDigitalReport = ev.Payload.Allows;
        }

        public void Apply(Event<TimereportRevertedToDraft> ev)
        {
            SetStatus(ev.Timestamp, TimereportStatus.Draft);
        }

        public void Apply(Event<TimereportWorkplaceUpdated> ev)
        {
            WorkplaceId = ev.Payload.WorkplaceId;
            Workplace = ev.Payload.WorkplaceName;
            DepartmentId = ev.Payload.DepartmentId;
            Department = ev.Payload.DepartmentName;
        }
    }
}