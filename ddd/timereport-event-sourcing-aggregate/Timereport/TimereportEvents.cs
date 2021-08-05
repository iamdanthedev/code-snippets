using System;
using System.Collections.Generic;
using Framework.Events;
using MongoDB.Bson;
using Util.Time;

namespace Domain.Timereport
{
    [AttributeUsage(AttributeTargets.Class)]
    public class MongoDiscriminatorAttribute : Attribute
    {
    }

    [MongoDiscriminator]
    public record TimereportCreatedPayload(
        DateTime CreatedOn,
        ObjectId ConsultantId,
        string Workplace,
        string Department,
        DateTime WeekDateUtc
    );

    [MongoDiscriminator]
    public record TimereportAssignedToBookingPayload(
        ObjectId BookingId,
        string Workplace,
        string WorkplaceId,
        string Department,
        string DepartmentId
    );

    [MongoDiscriminator]
    public record TimereportUnassignedFromBookingPayload;

    [MongoDiscriminator]
    public record TimereportWorkTimeUpdatedPayload(int Day, DayTimeRange? DayTimeRange);

    [MongoDiscriminator]
    public record TimereportExpensesUpdated(int Day, List<TimereportExpense> Value);

    [MongoDiscriminator]
    public record TimereportSickTimeUpdatedPayload(int Day, DayTimeRange? DayTimeRange);

    [MongoDiscriminator]
    public record TimereportVabTimeUpdatedPayload(int Day, DayTimeRange? DayTimeRange);

    [MongoDiscriminator]
    public record TimereportLunchMinutesUpdatedPayload(int Day, int Minutes);

    [MongoDiscriminator]
    public record TimereportMileageUpdatedPayload(int Day, int Mileage);

    [MongoDiscriminator]
    public record TimereportCommentUpdatedPayload(int Day, string Comment);

    [MongoDiscriminator]
    public record TimereportOnCallShiftsUpdatedPayload(int Day, List<OnCallShift> Shifts);

    [MongoDiscriminator]
    public record TimereportPreparednessAShiftsUpdatedPayload(int Day, List<PreparednessAShift> Shifts);

    [MongoDiscriminator]
    public record TimereportPreparednessBShiftsUpdatedPayload(int Day, List<PreparednessBShift> Shifts);

    [MongoDiscriminator]
    public record TimereportCanceledPayload(string Reason);

    [MongoDiscriminator]
    public record TimereportPaymentProcessedPayload(DateTime ProcessedOn, decimal TotalBill);

    [MongoDiscriminator]
    public record TimereportPaymentClearedPayload;

    [MongoDiscriminator]
    public record TimereportSubmittedByConsultantPayload(DateTime SubmittedOn);

    [MongoDiscriminator]
    public record TimereportSentToCustomerPayload(List<string> ContactPersons);

    [MongoDiscriminator]
    public record TimereportApprovedByCustomerPayload(string? ReviewId, string ReviewerName, DateTime ReviewedOn);

    [MongoDiscriminator]
    public record TimereportRejectedByCustomerPayload(string? ReviewId, string ReviewerName, DateTime ReviewedOne);

    [MongoDiscriminator]
    public record TimereportFirstCustomerNotificationIssued;

    [MongoDiscriminator]
    public record TimereportSecondCustomerNotificationIssued;

    [MongoDiscriminator]
    public record TimereportSentToHba;

    [MongoDiscriminator]
    public record TimereportApprovedByHba;

    [MongoDiscriminator]
    public record TimereportRejectedByHba;

    [MongoDiscriminator]
    public record TimereportSentToFinance;

    [MongoDiscriminator]
    public record TimereportApprovedByFinance;

    [MongoDiscriminator]
    public record TimereportRejectedByFinance;

    [MongoDiscriminator]
    public record TimereportSentToOc;

    [MongoDiscriminator]
    public record TimereportApprovedByOc;

    [MongoDiscriminator]
    public record TimereportRejectedByOc;

    [MongoDiscriminator]
    public record WorkplaceAllowsDigitalReportChangedPayload(bool Allows);

    [MongoDiscriminator]
    public record DepartmentAllowsDigitalReportChangedPayload(bool Allows);

    [MongoDiscriminator]
    public record TimereportRevertedToDraft;

    [MongoDiscriminator]
    public record TimereportWorkplaceUpdated(string WorkplaceId, string WorkplaceName, string DepartmentId,
        string DepartmentName);
}