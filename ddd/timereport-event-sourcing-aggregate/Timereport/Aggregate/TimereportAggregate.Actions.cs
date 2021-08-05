using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using Util.Time;

namespace Domain.Timereport.Aggregate
{
    public partial class TimereportAggregate
    {
        public TimereportAggregate()
        {
        }

        public TimereportAggregate(ObjectId consultantId, string workplace, string department, DateTime weekDateUtc)
        {
            Id = ObjectId.GenerateNewId();

            RaiseEvent(new TimereportCreatedPayload(
                DateTime.UtcNow,
                consultantId,
                workplace,
                department,
                weekDateUtc)
            );
        }

        public void AssignToBooking(ObjectId bookingId, string workplace, string workplaceId, string dept,
            string deptId)
        {
            var ev = new TimereportAssignedToBookingPayload(
                bookingId,
                workplace,
                workplaceId,
                dept,
                deptId
            );
            RaiseEvent(ev);
        }

        public void UnassignFromBooking()
        {
            var ev = new TimereportUnassignedFromBookingPayload();
            RaiseEvent(ev);
        }

        public void UpdateWorkTime(int day, DayTimeRange? dayTimeRange)
        {
            AssertIsEditable();
            var ev = new TimereportWorkTimeUpdatedPayload(day, dayTimeRange);
            RaiseEvent(ev);
        }

        public void UpdateSickTime(int day, DayTimeRange? dayTimeRange)
        {
            AssertIsEditable();
            var ev = new TimereportSickTimeUpdatedPayload(day, dayTimeRange);
            RaiseEvent(ev);
        }

        public void UpdateVabTime(int day, DayTimeRange? dayTimeRange)
        {
            AssertIsEditable();
            var ev = new TimereportVabTimeUpdatedPayload(day, dayTimeRange);
            RaiseEvent(ev);
        }

        public void UpdateLunchMinutes(int day, int minutes)
        {
            AssertIsEditable();
            var ev = new TimereportLunchMinutesUpdatedPayload(day, minutes);
            RaiseEvent(ev);
        }

        public void UpdateMileage(int day, int mileage)
        {
            AssertIsEditable();
            var ev = new TimereportMileageUpdatedPayload(day, mileage);
            RaiseEvent(ev);
        }

        public void UpdateComment(int day, string comment)
        {
            AssertIsEditable();
            var ev = new TimereportCommentUpdatedPayload(day, comment);
            RaiseEvent(ev);
        }

        public void UpdateExpenses(int day, IEnumerable<TimereportExpense> expenses)
        {
            AssertIsEditable();
            RaiseEvent(new TimereportExpensesUpdated(day, expenses.ToList()));
        }

        public void UpdateOnCallShifts(int day, List<OnCallShift> shifts)
        {
            AssertIsEditable();
            var ev = new TimereportOnCallShiftsUpdatedPayload(day, shifts);
            RaiseEvent(ev);
        }

        public void UpdatePreparednessAShifts(int day, List<PreparednessAShift> shifts)
        {
            AssertIsEditable();
            var ev = new TimereportPreparednessAShiftsUpdatedPayload(day, shifts);
            RaiseEvent(ev);
        }

        public void UpdatePreparednessBShifts(int day, List<PreparednessBShift> shifts)
        {
            AssertIsEditable();
            var ev = new TimereportPreparednessBShiftsUpdatedPayload(day, shifts);
            RaiseEvent(ev);
        }

        public void SetPaymentProcessed(decimal totalBill) =>
            RaiseEvent(new TimereportPaymentProcessedPayload(DateTime.UtcNow, totalBill));

        public void SetPaymentCleared() => RaiseEvent(new TimereportPaymentClearedPayload());

        public void SubmitByConsultant()
        {
            if (Status != TimereportStatus.Draft)
            {
                throw new Exception("time report must be in draft status in order to be submitted");
            }

            var ev = new TimereportSubmittedByConsultantPayload(DateTime.UtcNow);
            RaiseEvent(ev);
        }

        public void SetSentToCustomer(List<string> contactPersons)
        {
            if (Status == TimereportStatus.Canceled)
            {
                throw new Exception("Cannot modified a canceled timereport");
            }

            var ev = new TimereportSentToCustomerPayload(contactPersons);
            RaiseEvent(ev);
        }

        public void IssueFirstCustomerNotification()
        {
            RaiseEvent(new TimereportFirstCustomerNotificationIssued());
        }

        public void IssueSecondCustomerNotification()
        {
            RaiseEvent(new TimereportSecondCustomerNotificationIssued());
        }

        public void SetApprovedByCustomer(string? reviewId, string reviewerName, DateTime reviewedOn)
        {
            if (Status == TimereportStatus.Canceled)
            {
                throw new Exception("Cannot modified a canceled timereport");
            }

            var ev = new TimereportApprovedByCustomerPayload(reviewId, reviewerName, reviewedOn);
            RaiseEvent(ev);
        }

        public void SetRejectedByCustomer(string? reviewId, string reviewerName, DateTime reviewedOn)
        {
            if (Status == TimereportStatus.Canceled)
            {
                throw new Exception("Cannot modified a canceled timereport");
            }

            var ev = new TimereportRejectedByCustomerPayload(reviewId, reviewerName, reviewedOn);
            RaiseEvent(ev);
        }

        public void Cancel(string reason) => RaiseEvent(new TimereportCanceledPayload(reason));

        public void SetSentToHba() => RaiseEvent(new TimereportSentToHba());
        public void SetApprovedByHba() => RaiseEvent(new TimereportApprovedByHba());
        public void SetRejectedByHba() => RaiseEvent(new TimereportRejectedByHba());

        public void SetSentToFinance() => RaiseEvent(new TimereportSentToFinance());
        public void SetApprovedByFinance() => RaiseEvent(new TimereportApprovedByFinance());
        public void SetRejectedByFinance() => RaiseEvent(new TimereportRejectedByFinance());

        public void SetSentToOc() => RaiseEvent(new TimereportSentToOc());
        public void SetApprovedByOc() => RaiseEvent(new TimereportApprovedByOc());
        public void SetRejectedByOc() => RaiseEvent(new TimereportRejectedByOc());

        public void SetWorkplaceAllowsDigitalReport(bool allows) =>
            RaiseEvent(new WorkplaceAllowsDigitalReportChangedPayload(allows));

        public void SetDepartmentAllowsDigitalReport(bool allows) =>
            RaiseEvent(new DepartmentAllowsDigitalReportChangedPayload(allows));

        public void RevertToDraft()
         {
            if (Status == TimereportStatus.Draft)
            {
                throw new Exception("timereport is Draft");
            }
            
            RaiseEvent(new TimereportRevertedToDraft());
        }

        public void UpdateWorkplace(string workplaceId, string workplaceName, string departmentId,
            string departmentName)
        {
            RaiseEvent(new TimereportWorkplaceUpdated(workplaceId, workplaceName, departmentId, departmentName));
        }
    }
}