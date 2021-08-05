namespace Domain.Timereport
{
    public enum TimereportStatus
    {
        Blank,
        Draft,
        SubmittedByConsultant,
        SentToCustomer,
        ApprovedByCustomer,
        RejectedByCustomer,
        ConsultantPaymentProcessed,
        Canceled
    }
}