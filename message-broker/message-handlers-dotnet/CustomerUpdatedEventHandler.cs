using System.Linq;
using System.Threading.Tasks;
using Bonliva.Messaging.Messages.Events;
using Bonliva.Messaging.Subscriber;
using Dasync.Collections;
using Domain.Timereport;
using Domain.Timereport.Aggregate;
using Framework.Domain;
using Service;

namespace Api.EventHandlers
{
    public class CustomerUpdatedEventHandler : EventHandler<CustomerUpdatedEvent>
    {
        private readonly ITimereportFullProjectionQuery _fullProjectionQuery;
        private readonly IRepository<TimereportAggregate> _timereportRepository;
        private readonly CustomerService _customerService;

        public CustomerUpdatedEventHandler(ITimereportFullProjectionQuery fullProjectionQuery, CustomerService customerService, IRepository<TimereportAggregate> timereportRepository)
        {
            _fullProjectionQuery = fullProjectionQuery;
            _customerService = customerService;
            _timereportRepository = timereportRepository;
        }

        public override async Task Handle(CustomerUpdatedEvent message)
        {
            var projections = await _fullProjectionQuery.GetByCustomerId(message.CustomerId);

            if (!projections.Any())
            {
                return;
            }

            var customer = await _customerService.GetCustomerByIdAsync(message.CustomerId);
            var allowDigitalReport = !customer.NeedTimereportSignature;

            await projections.ParallelForEachAsync(async projection =>
            {
                // maybe update projection CustomerAllowDigitalReport
                if (projection.CustomerAllowsDigitalReport == allowDigitalReport)
                {
                    return;
                }

                var timereport = await _timereportRepository.GetByIdAsync(projection.AggregateId);

                if (timereport.WorkplaceId == message.CustomerId)
                {
                    timereport.SetWorkplaceAllowsDigitalReport(allowDigitalReport);
                }

                if (timereport.DepartmentId == message.CustomerId)
                {
                    timereport.SetDepartmentAllowsDigitalReport(allowDigitalReport);
                }

                await _timereportRepository.SaveAsync(timereport);
            });
        }
    }
}
