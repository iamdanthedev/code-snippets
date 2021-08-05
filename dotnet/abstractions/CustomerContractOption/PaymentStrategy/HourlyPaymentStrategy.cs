using CustomerContract.CustomerContractOption.Interface;
using Util.Enum;

namespace CustomerContract.CustomerContractOption.PaymentStrategy
{
    public class HourlyPaymentStrategy : IPaymentStrategy
    {
        public HourlyPaymentStrategy(WorkType workType, decimal hourlyPrice)
        {
            WorkType = workType;
            HourlyPrice = hourlyPrice;
        }

        public WorkType WorkType { get; }
        public decimal HourlyPrice { get; }
        public bool RestTimeNotPaid { get; set; } = true;
    }
}