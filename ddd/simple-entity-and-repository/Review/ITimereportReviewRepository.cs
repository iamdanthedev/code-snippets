using System.Threading.Tasks;

namespace Domain.Review
{
    public interface ITimereportReviewRepository
    {
        Task InsertOne(TimereportReview review);
        Task<TimereportReview?> GetById(string id);
    }
}