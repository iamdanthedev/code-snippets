using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Azure.Messaging.ServiceBus.Administration;
using Bonliva.Messaging.Publisher;
using Bonliva.Messaging.Subscriber;
using Messaging.Messages;
using Microsoft.Extensions.DependencyInjection;

namespace Bonliva.Messaging.DependencyInjection
{
    public class AddMessagePublisherOptions : MessagePublisherOptions
    {
    }

    public class AddMessageSubscriberOptions : MessageSubscriberOptions
    {
        public List<Assembly> LookupHandlersAssemblies { get; } = new List<Assembly>();

        public void AddHandlerContainingAssemblies(IEnumerable<Assembly> assemblies)
        {
            LookupHandlersAssemblies.AddRange(assemblies);
        }

        public void AddHandlerContainingAssembly(Assembly assembly)
        {
            LookupHandlersAssemblies.Add(assembly);
        }
    }

    public static class MessagingExtension
    {
        public static void AddMessagePublisher(this IServiceCollection services,
            Action<AddMessagePublisherOptions> optionsBuilder)
        {
            var options = new AddMessagePublisherOptions();
            optionsBuilder(options);
            Validator.ValidateValue(options, new ValidationContext(options), new List<ValidationAttribute>());

            services.AddSingleton<MessagePublisherOptions>(options);
            services.AddScoped<IMessagePublisher, MessagePublisher>();
        }

        public static void AddMessageSubscriber(this IServiceCollection services,
            Action<AddMessageSubscriberOptions> optionsBuilder)
        {
            var options = new AddMessageSubscriberOptions();
            optionsBuilder(options);
            Validator.ValidateValue(options, new ValidationContext(options), new List<ValidationAttribute>());

            var messageTypes = DiscoverMessageTypes(new[] {MessagingEventsAssembly.GetAssembly()});
            var handlerTypes = DiscoverEventHandlerTypes(options.LookupHandlersAssemblies);

            Console.WriteLine($"Discovered messages: {messageTypes.Count()}");
            Console.WriteLine($"Discovered handlers: {handlerTypes.Count()}");

            services.AddSingleton<MessageSubscriberOptions>(options);
            services.AddSingleton<MessageSubscriber>();
            services.AddHostedService<MessageSubscriberHostedService>();

            foreach (var handlerType in handlerTypes)
            {
                Console.WriteLine($"Registering handler {handlerType.Name}");
                services.AddTransient(handlerType);
            }

            services.AddSingleton<IEventHandlerFactory>(ctx =>
            {
                var handlerFactory = new EventHandlerFactory(messageTypes, handlerTypes);
                return handlerFactory;
            });

            services.AddScoped<MessageProcessor>();
            services.AddScoped<IMessagePublisherContext, MessagePublisherContext>();

            AddSubscriptionFilters(options);
        }

        private static async void AddSubscriptionFilters(AddMessageSubscriberOptions options)
        {
            var client = new ServiceBusAdministrationClient(options.ConnectionString);

            IAsyncEnumerator<RuleProperties> rules = client.GetRulesAsync(options.TopicName, options.SubscriptionName)
                .GetAsyncEnumerator();
            while (await rules.MoveNextAsync())
            {
                Console.WriteLine($"Remove filter {rules.Current.Name}");
                await client.DeleteRuleAsync(options.TopicName, options.SubscriptionName, rules.Current.Name);
            }

            await Task.Delay(1000);

            var messageTypes = DiscoverEventHandlerTypes(options.LookupHandlersAssemblies)
                .Select(handlerType => handlerType.BaseType?.GetGenericArguments()[0])
                .Where(itemType => itemType != null).Select(x => $"'{x.Name}'").ToList();

            if (messageTypes.Any())
            {
                await client.CreateRuleAsync(options.TopicName, options.SubscriptionName, new CreateRuleOptions()
                {
                    Filter = new SqlRuleFilter(
                        $"Name IN ({string.Join(",", messageTypes)})"),
                    Name = "SqlFilterByName"
                });
            }
        }

        private static List<Type> DiscoverMessageTypes(IEnumerable<Assembly> assemblies)
        {
            var messageAttrType = typeof(MessageAttribute);

            return assemblies
                .SelectMany(x => x.GetTypes())
                .Where(x => x.IsClass && !x.IsAbstract)
                .Where(x => x.IsDefined(messageAttrType, false))
                .ToList();
        }

        private static List<Type> DiscoverEventHandlerTypes(IEnumerable<Assembly> assemblies)
        {
            var baseHandlerType = typeof(Subscriber.EventHandler<>);

            return assemblies
                .SelectMany(x => x.GetTypes())
                .Where(x => x.IsClass && !x.IsAbstract)
                .Where(x => x.BaseType != null && x.BaseType.IsGenericType &&
                            x.BaseType.GetGenericTypeDefinition() == baseHandlerType)
                .ToList();
        }
    }
}