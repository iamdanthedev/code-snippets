using System.Collections.Generic;
using System.Threading.Tasks;

namespace Bonliva.Messaging.Publisher
{
    public interface IMessagePublisher
    {
        Task PublishAsync<T>(T message) where T : class;

        Task PublishAsync<T>(List<T> messages) where T : class;
    }
}