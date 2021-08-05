using System;
ZZZZZZZZZZ
using System.Reflection;
using Domain;
using Domain.Review;
using Domain.ReviewInvitation;
using Domain.Timereport;
using Domain.Timereport.Projection;
using Domain.Timereport.Projection.FullProjection;
using Domain.Timereport.Types;
using Framework.Events;
using Mongo.Serializer;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;
using MoreLinq;
using Util.Time;

namespace Mongo
{
    public class DayTimeRangeSerializationProvider : IBsonSerializationProvider
    {
        public IBsonSerializer GetSerializer(Type type)
        {
            return type == typeof(DayTimeRange) ? new DayTimeRangeSerializer() : null;
        }
    }

    public static class ClassMapping
    {
        public static void SetMapping(Assembly eventContainingAssembly)
        {
            var conventions = new ConventionPack
            {
                new EnumRepresentationConvention(BsonType.String),
                new CamelCaseElementNameConvention(),
                new IgnoreExtraElementsConvention(true)
            };

            ConventionRegistry.Register("bonliva_conventions", conventions, x => true);

            BsonSerializer.RegisterSerializationProvider(new DayTimeRangeSerializationProvider());

            BsonClassMap.RegisterClassMap<TimereportDay>(cm =>
            {
                cm.MapMember(x => x.Date)
                    .SetElementName("date");

                cm.MapMember(x => x.WorkTimeRange)
                    .SetElementName("workTimeRange")
                    .SetSerializer(new DayTimeRangeSerializer());

                cm.MapMember(x => x.SickTimeRange)
                    .SetElementName("sickTimeRange")
                    .SetSerializer(new DayTimeRangeSerializer());

                cm.MapMember(x => x.VabTimeRange)
                    .SetElementName("vabTimeRange")
                    .SetSerializer(new DayTimeRangeSerializer());

                cm.MapMember(x => x.ConsultantLunchMinutes)
                    .SetElementName("consultantLunchMinutes");

                cm.MapMember(x => x.ConsultantComment)
                    .SetElementName("consultantComment");

                cm.MapMember(x => x.ConsultantMileage)
                    .SetElementName("consultantMileage");

                cm.MapMember(x => x.ConsultantExpenses)
                    .SetElementName("consultantExpenses");

                cm.MapMember(x => x.OnCallShifts)
                    .SetElementName("onCallShifts");

                cm.MapMember(x => x.PreparednessAShifts)
                    .SetElementName("preparednessAShifts");

                cm.MapMember(x => x.PreparednessBShifts)
                    .SetElementName("preparednessBShifts");
            });

            BsonClassMap.RegisterClassMap<DayTimeRange>(cm =>
            {
                cm.MapMember(x => x.Start)
                    .SetElementName("start");

                cm.MapMember(x => x.End)
                    .SetElementName("end");
            });

            BsonClassMap.RegisterClassMap<OnCallShift>(cm =>
            {
                cm.MapMember(x => x.TimeRange)
                    .SetElementName("timeRange")
                    .SetSerializer(new DayTimeRangeSerializer());

                cm.MapMember(x => x.PassivePeriods)
                    .SetElementName("passivePeriods");
            });

            BsonClassMap.RegisterClassMap<OnCallPassivePeriod>(cm =>
            {
                cm.MapMember(x => x.TimeRange)
                    .SetElementName("timeRange")
                    .SetSerializer(new DayTimeRangeSerializer());
            });

            BsonClassMap.RegisterClassMap<PreparednessAShift>(cm =>
            {
                cm.MapMember(x => x.TimeRange)
                    .SetElementName("timeRange")
                    .SetSerializer(new DayTimeRangeSerializer());

                cm.MapMember(x => x.ActivePeriods)
                    .SetElementName("activePeriods");
            });

            BsonClassMap.RegisterClassMap<PreparednessBShift>(cm =>
            {
                cm.MapMember(x => x.TimeRange)
                    .SetElementName("timeRange");

                cm.MapMember(x => x.ActivePeriods)
                    .SetElementName("activePeriods");
            });

            BsonClassMap.RegisterClassMap<PreparednessActivePeriod>(cm =>
            {
                cm.MapMember(x => x.TimeRange)
                    .SetElementName("timeRange")
                    .SetSerializer(new DayTimeRangeSerializer());
            });

            BsonClassMap.RegisterClassMap<Money>(cm =>
            {
                cm.MapMember(x => x.Value)
                    .SetElementName("value");

                cm.MapMember(x => x.Currency)
                    .SetSerializer(new EnumSerializer<Currency>(BsonType.String))
                    .SetElementName("currency");
            });

            BsonClassMap.RegisterClassMap<TimereportFullProjection>(cm =>
            {
                cm.AutoMap();
                cm.MapMember(x => x.SentToCustomerTrack).SetDefaultValue(new SentToCustomerTrack());
            });

            RegisterEventMaps(eventContainingAssembly);
        }

        private static void RegisterEventMaps(Assembly eventContainingAssembly)
        {
            var mi = typeof(BsonClassMap).GetMethod("RegisterClassMap", Array.Empty<Type>());

            eventContainingAssembly.GetTypes()
                .ForEach(type =>
                {

                    if (Attribute.GetCustomAttribute(type, typeof(MongoDiscriminatorAttribute)) == null)
                        return;

                    var genericMi = mi.MakeGenericMethod(type);
                    genericMi.Invoke(null, Array.Empty<object>());
                });
        }
    }
}
