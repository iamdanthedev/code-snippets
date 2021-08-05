using CustomerContract.CustomerContractOption.Interface;
using CustomerContract.CustomerContractOption.PaymentStrategy;
using CustomerContract.CustomerContractOption.ScheduleStrategy;

namespace CustomerContract.CustomerContractOption
{
    public class ContractOption : IContractOption, IContractOption<IScheduleStrategy, IPaymentStrategy>
    {
        public ContractOption(string id, string name, IScheduleStrategy scheduleStrategy,
            IPaymentStrategy paymentStrategy)
        {
            Id = id;
            Name = name;
            ScheduleStrategy = scheduleStrategy;
            PaymentStrategy = paymentStrategy;
        }

        public string Id { get; set; }
        public string Name { get; set; }

        public IScheduleStrategy ScheduleStrategy { get; set; }
        public IPaymentStrategy PaymentStrategy { get; set; }
    }
}