using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Bonliva.Messaging.DependencyInjection;
using Bonliva.Messaging.Messages.Events;
using Bonliva.Messaging.Publisher;
using MessagingTest.EventHandlers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MessagingTest
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            await Host.CreateDefaultBuilder()
                .ConfigureServices((context, services) =>
                {
                    services.AddApplicationInsightsTelemetryWorkerService("16450146-6eaf-485f-ad94-fc57ffbc4e5a");

                    services.AddMessagePublisher(config =>
                    {
                        config.ConnectionString = context.Configuration["ServiceBus:ConnectionString"];
                        config.TopicName = context.Configuration["ServiceBus:TopicName"];
                    });

                    services.AddMessageSubscriber(config =>
                    {
                        config.ConnectionString = context.Configuration["ServiceBus:ConnectionString"];
                        config.TopicName = context.Configuration["ServiceBus:TopicName"];
                        config.SubscriptionName = context.Configuration["ServiceBus:SubscriptionName"];
                        config.AddHandlerContainingAssembly(typeof(WorkrequestUpdatedEventHandler).Assembly);
                    });

                    services.AddHostedService<SenderHostedService>();
                })
                .RunConsoleAsync();
        }
    }

    public class SenderHostedService : IHostedService
    {
        private IMessagePublisher _publisher;

        public SenderHostedService(IMessagePublisher publisher)
        {
            _publisher = publisher;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            while (true)
            {
                var messages1 = new List<WorkRequestModifiedEvent>();
                var messages2 = new List<TodoAddedEvent>();
                for (var i = 0; i < 3; i += 1)
                {
                    // messages1.Add(new WorkRequestModifiedEvent
                    // {
                    //     WorkRequestId = DateTimeOffset.Now.ToUnixTimeSeconds()
                    //         .ToString(),
                    //     IsNew = false
                    // });
                    messages2.Add(new TodoAddedEvent(TodoId: DateTimeOffset.Now.ToUnixTimeSeconds()
                        .ToString()));
                    await Task.Delay(1000, cancellationToken);
                }

                Console.WriteLine($"Send count of messages: {messages1.Count + messages2.Count}");

                await _publisher.PublishAsync(messages1);
                await _publisher.PublishAsync(messages2);

                await Task.Delay(20000, cancellationToken);
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}