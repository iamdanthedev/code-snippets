using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.ReviewInvitation
{
    public interface ITimereportReviewInvitationRepository
    {
        Task InsertManyAsync(IEnumerable<TimereportReviewInvitation> invitations);
        Task<TimereportReviewInvitation?> FindByHashKey(string hashKey);
    }
}