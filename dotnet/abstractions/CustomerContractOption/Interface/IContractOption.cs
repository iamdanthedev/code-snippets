using CustomerContract.CustomerContractOption.PaymentStrategy;
using CustomerContract.CustomerContractOption.ScheduleStrategy;

namespace CustomerContract.CustomerContractOption.Interface
{
    public interface IContractOption<out TScheduleStrategy, out TPaymentStrategy> : IContractOption
    {
        public TScheduleStrategy ScheduleStrategy { get; }
        public TPaymentStrategy PaymentStrategy { get; }
    }

    public interface IContractOption
    {
        public string Id { get; }
        public string Name { get; }
    }
}