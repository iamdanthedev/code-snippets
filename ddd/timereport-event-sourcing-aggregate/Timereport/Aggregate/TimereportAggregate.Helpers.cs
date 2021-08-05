using System;
using System.Linq;
using Framework.Domain;

namespace Domain.Timereport.Aggregate
{
    public partial class TimereportAggregate : AggregateRoot
    {
        public DateTime GetDateTimeOnDay(int day)
        {
            return StartsOnUtc.Add(TimeSpan.FromDays(day));
        }

        public bool IsEditable => Status is TimereportStatus.Blank or TimereportStatus.Draft;

        public void AssertIsEditable()
        {
            if (!IsEditable)
            {
                throw new TimereportNotEditableException();
            }
        }

        private bool IsBlank()
        {
            return Days.All(day => day.IsBlank());
        }

        private void MaybeChangeBlankDraftStatus(DateTime timestamp)
        {
            switch (Status)
            {
                case TimereportStatus.Blank when !IsBlank():
                    SetStatus(timestamp, TimereportStatus.Draft);
                    StatusChangedAutomatically = true;
                    break;
                case TimereportStatus.Draft when IsBlank():
                    SetStatus(timestamp, TimereportStatus.Blank);
                    StatusChangedAutomatically = true;
                    break;
            }
        }
    }

    public class TimereportNotEditableException : Exception
    {
        public TimereportNotEditableException() : base("Cannot edit time report")
        {
        }
    }
}