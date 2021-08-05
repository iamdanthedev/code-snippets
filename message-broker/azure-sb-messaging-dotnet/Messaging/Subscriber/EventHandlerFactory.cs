using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;

namespace Bonliva.Messaging.Subscriber
{
    public class EventHandlerFactory : IEventHandlerFactory
    {
        private readonly List<Type> _handlerClasses;
        private readonly List<Type> _messageClasses;

        public EventHandlerFactory(List<Type> messageClasses, List<Type> handlerClasses)
        {
            _messageClasses = messageClasses;
            _handlerClasses = handlerClasses;
        }

        public Type? GetMessageType(string messageName)
        {
            return _messageClasses.FirstOrDefault(x =>
                string.Equals(x.Name, messageName, StringComparison.CurrentCultureIgnoreCase));
        }

        public EventHandler? InstantiateHandler(IServiceProvider serviceProvider, string messageName)
        {
            var messageType = GetMessageType(messageName);

            if (messageType == null)
            {
                return null;
            }

            var handlerType = _handlerClasses
                .FirstOrDefault(x => x.BaseType.GetGenericArguments()[0] == messageType);

            if (handlerType == null)
            {
                return null;
            }

            return (EventHandler?) serviceProvider.GetRequiredService(handlerType);
        }
    }
}