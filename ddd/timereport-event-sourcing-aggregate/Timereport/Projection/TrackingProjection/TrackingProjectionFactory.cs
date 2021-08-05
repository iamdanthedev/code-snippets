using System.Collections.Generic;
using System.Linq;
using Domain.Timereport.Aggregate;
using Framework.Events;

namespace Domain.Timereport.Projection.TrackingProjection
{
    public static class TrackingProjectionFactory
    {
        public static TimereportTrackingProjection Create(TimereportAggregate aggregate,
            IEnumerable<Event> events)
        {
            var eventList = events.ToList();

            var createdEvent = GetCreated(eventList);
            var draftEvent = GetSetToDraft(eventList);
            var consultantSubmit = GetConsultantSubmit(eventList);
            var sentToCustomer = GetSentToCustomer(eventList);
            var approvedByCustomer = GetApprovedByCustomer(eventList);
            var rejectedByCustomer = GetRejectedByCustomer(eventList);
            var paymentProcessed = GetPaymentProcessed(eventList);

            var sentToHba = GetSentToHba(eventList);
            var approvedByHba = GetApprovedByHba(eventList);
            var rejectedByHba = GetRejectedByHba(eventList);

            var sentToFinance = GetSentToFinance(eventList);
            var approvedByFinance = GetApprovedByFinance(eventList);
            var rejectedByFinance = GetRejectedByFinance(eventList);

            var sentToOc = GetSentToOc(eventList);
            var approvedByOc = GetApprovedByOc(eventList);
            var rejectedByOc = GetRejectedByOc(eventList);

            var result = new TimereportTrackingProjection()
            {
                AggregateId = aggregate.Id,
                AggregateVersion = aggregate.Version,

                Status = aggregate.Status,

                CreateOperation = GetOperation(createdEvent)!,
                DraftOperation = GetOperation(draftEvent),
                ConsultantSubmitOperation = GetOperation(consultantSubmit),
                SentToCustomerOperation = GetSentToCustomerOperation(sentToCustomer),
                ApprovedByCustomerOperation = GetReviewOperation(approvedByCustomer),
                RejectedByCustomerOperation = GetReviewOperation(rejectedByCustomer),
                ConsultantPaymentProcessedOperation = paymentProcessed != null
                    ? new ConsultantPaymentProcessedOperation()
                    {
                        User = GetOperation(paymentProcessed)!.User,
                        DateUtc = GetOperation(paymentProcessed)!.DateUtc,
                        ConsultantPaymentTotal = paymentProcessed.Payload.TotalBill
                    }
                    : null,

                SentToHbaOperation = GetOperation(sentToHba),
                ApprovedByHbaOperation = GetOperation(approvedByHba),
                RejectedByHbaOperation = GetOperation(rejectedByHba),

                SentToFinanceOperation = GetOperation(sentToFinance),
                ApprovedByFinanceOperation = GetOperation(approvedByFinance),
                RejectedByFinanceOperation = GetOperation(rejectedByFinance),

                SentToOcOperation = GetOperation(sentToOc),
                ApprovedByOcOperation = GetOperation(approvedByOc),
                RejectedByOcOperation = GetOperation(rejectedByOc),
            };

            return result;
        }

        private static TimereportOperation? GetOperation(IEvent? eventEnvelope)
        {
            if (eventEnvelope == null)
            {
                return null;
            }

            return new TimereportOperation()
            {
                User = new TimereportTrackingUserRef()
                {
                    Id = eventEnvelope.UserId.ToString(),
                    Name = eventEnvelope.UserName
                },
                DateUtc = eventEnvelope.Timestamp
            };
        }

        private static TimereportSentToCustomerOperation? GetSentToCustomerOperation(
            Event<TimereportSentToCustomerPayload>? ev)
        {
            if (ev == null)
            {
                return null;
            }

            return new TimereportSentToCustomerOperation
            {
                User = GetOperation(ev)!.User,
                DateUtc = GetOperation(ev)!.DateUtc,
                ContactPersons = ev.Payload.ContactPersons
            };
        }

        private static TimereportReviewOperation? GetReviewOperation(
            Event<TimereportApprovedByCustomerPayload>? eventEnvelope)
        {
            if (eventEnvelope == null)
            {
                return null;
            }

            return new TimereportReviewOperation()
            {
                User = GetOperation(eventEnvelope)!.User,
                DateUtc = GetOperation(eventEnvelope)!.DateUtc,
                ContactPerson = eventEnvelope.Payload.ReviewerName
            };
        }

        private static TimereportReviewOperation? GetReviewOperation(
            Event<TimereportRejectedByCustomerPayload>? eventEnvelope)
        {
            if (eventEnvelope == null)
            {
                return null;
            }

            return new TimereportReviewOperation()
            {
                User = GetOperation(eventEnvelope)!.User,
                DateUtc = GetOperation(eventEnvelope)!.DateUtc,
                ContactPerson = eventEnvelope.Payload.ReviewerName
            };
        }

        private static Event<TimereportCreatedPayload> GetCreated(IEnumerable<Event> events)
        {
            return events.OfEventType<TimereportCreatedPayload>().First();
        }

        private static Event<TimereportRevertedToDraft>? GetSetToDraft(IEnumerable<Event> events)
        {
            return events.OfEventType<TimereportRevertedToDraft>().FirstOrDefault();
        }

        private static Event<TimereportSubmittedByConsultantPayload>? GetConsultantSubmit(
            IEnumerable<Event> events)
        {
            var result = events.OfEventType<TimereportSubmittedByConsultantPayload>().FirstOrDefault();
            return result;
        }

        private static Event<TimereportSentToCustomerPayload>? GetSentToCustomer(
            IEnumerable<Event> events)
        {
            return events.OfEventType<TimereportSentToCustomerPayload>().LastOrDefault();
        }

        private static Event<TimereportApprovedByCustomerPayload>? GetApprovedByCustomer(
            IEnumerable<Event> events)
        {
            return events.OfEventType<TimereportApprovedByCustomerPayload>().LastOrDefault();
        }

        private static Event<TimereportRejectedByCustomerPayload>? GetRejectedByCustomer(
            IEnumerable<Event> events)
        {
            return events.OfEventType<TimereportRejectedByCustomerPayload>().LastOrDefault();
        }

        private static Event<TimereportPaymentProcessedPayload>? GetPaymentProcessed(
            IEnumerable<Event> events)
        {
            var ordered = events.OrderBy(x => x.Timestamp);

            var lastPaymentProcessed = ordered.OfEventType<TimereportPaymentProcessedPayload>().LastOrDefault();
            var lastPaymentCleared = ordered.OfEventType<TimereportPaymentClearedPayload>().LastOrDefault();

            if (lastPaymentProcessed == null)
            {
                return null;
            }

            if (lastPaymentCleared == null ||
                lastPaymentProcessed.Payload.ProcessedOn > lastPaymentCleared.Timestamp)
            {
                return lastPaymentProcessed;
            }

            return null;
        }


        private static Event<TimereportSentToHba>? GetSentToHba(List<Event> events)
        {
            return events.OfEventType<TimereportSentToHba>().LastOrDefault();
        }

        private static Event<TimereportApprovedByHba>? GetApprovedByHba(List<Event> events)
        {
            return events.OfEventType<TimereportApprovedByHba>().LastOrDefault();
        }

        private static Event<TimereportRejectedByHba>? GetRejectedByHba(List<Event> events)
        {
            return events.OfEventType<TimereportRejectedByHba>().LastOrDefault();
        }

        private static Event<TimereportSentToFinance>? GetSentToFinance(List<Event> events)
        {
            return events.OfEventType<TimereportSentToFinance>().LastOrDefault();
        }

        private static Event<TimereportApprovedByFinance>? GetApprovedByFinance(List<Event> events)
        {
            return events.OfEventType<TimereportApprovedByFinance>().LastOrDefault();
        }

        private static Event<TimereportRejectedByFinance>? GetRejectedByFinance(List<Event> events)
        {
            return events.OfEventType<TimereportRejectedByFinance>().LastOrDefault();
        }

        private static Event<TimereportSentToOc>? GetSentToOc(List<Event> events)
        {
            return events.OfEventType<TimereportSentToOc>().LastOrDefault();
        }

        private static Event<TimereportApprovedByOc>? GetApprovedByOc(List<Event> events)
        {
            return events.OfEventType<TimereportApprovedByOc>().LastOrDefault();
        }

        private static Event<TimereportRejectedByOc>? GetRejectedByOc(List<Event> events)
        {
            return events.OfEventType<TimereportRejectedByOc>().LastOrDefault();
        }
    }
}