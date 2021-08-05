using System;

namespace Bonliva.Messaging.Subscriber
{
    public interface IEventHandlerFactory
    {
        Type? GetMessageType(string messageName);
        EventHandler? InstantiateHandler(IServiceProvider serviceProvider, string messageName);
    }
}
