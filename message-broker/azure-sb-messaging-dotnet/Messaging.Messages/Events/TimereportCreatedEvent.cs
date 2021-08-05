using System;
using TypeGen.Core.TypeAnnotations;

namespace Bonliva.Messaging.Messages.Events
{
    [Message]
    [ExportTsClass]
    public record TimereportCreatedEvent(
        string TimereportId,
        string? BookingId,
        string ConsultantId,
        string Workplace,
        string Department,
        DateTime StartsOnUtc,
        int Week,
        int Year
    )
    {
    }
}