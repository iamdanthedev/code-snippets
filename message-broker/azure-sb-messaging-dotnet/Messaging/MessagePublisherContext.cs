using System;

namespace Bonliva.Messaging
{
    public interface IMessagePublisherContext
    {
        string CorrelationId { get; set; }
    }

    public class MessagePublisherContext : IMessagePublisherContext
    {
        public string CorrelationId { get; set; }
    }
}