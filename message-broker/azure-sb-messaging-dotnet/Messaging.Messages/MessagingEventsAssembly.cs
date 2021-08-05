using System.Reflection;

namespace Messaging.Messages
{
    public static class MessagingEventsAssembly
    {
        public static Assembly GetAssembly()
        {
            return typeof(MessagingEventsAssembly).Assembly;
        }
        
    }
}