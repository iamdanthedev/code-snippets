using System;

namespace Bonliva.Messaging
{
    public class MessageAttribute : Attribute
    {
    }

    public class MessageEnvelope
    {
        public static MessageEnvelope Create(string name, object message)
        {
            return new MessageEnvelope
            {
                Name = name,
                Body = message
            };
        }

        public string Name { get; set; }
        public object Body { get; set; }
    }
}