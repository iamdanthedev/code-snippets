using System;
using MongoDB.Bson;

namespace Domain.Review
{
    public class TimereportReview
    {
        public static TimereportReview Approve(string invitationId, string email, string comment) =>
            new()
            {
                InvitationId = invitationId,
                ReviewedBy = email,
                ReviewedOn = DateTime.UtcNow,
                Comment = comment,
                Approved = true
            };

        public static TimereportReview Reject(string invitationId, string email, string comment) =>
            new()
            {
                InvitationId = invitationId,
                ReviewedBy = email,
                ReviewedOn = DateTime.UtcNow,
                Comment = comment,
                Approved = false
            };

        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
        public string InvitationId { get; set; }
        public string ReviewedBy { get; set; }
        public DateTime ReviewedOn { get; set; }
        public string Comment { get; set; }
        public bool Approved { get; set; }
    }
}