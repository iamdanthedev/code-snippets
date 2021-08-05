using System;
using MongoDB.Bson;

namespace Domain.ReviewInvitation
{
    public class TimereportReviewInvitation
    {
        public static TimereportReviewInvitation Create(string timereportId, string email)
        {
            return new()
            {
                Email = email,
                TimereportId = timereportId,
                IssuedOn = DateTime.UtcNow,
                HashKey = GetHashKey(timereportId, email)
            };
        }

        public static string GetHashKey(string timereportId, string email)
        {
            var str = $"{timereportId}|||{email}";
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(str));
        }

        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
        public string Email { get; set; }
        public string TimereportId { get; set; }
        public DateTime IssuedOn { get; set; }
        public string HashKey { get; set; }
    }
}