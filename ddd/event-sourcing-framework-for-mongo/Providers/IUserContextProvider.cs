using MongoDB.Bson;

namespace Framework.Providers
{
    public class UserContext
    {
        public string UserName { get; set; }
        public ObjectId UserId { get; set; }
    }
    
    public interface IUserContextProvider
    {
        UserContext GetUserContext();
        void SetUserContext(string userId, string userName);
    }
}