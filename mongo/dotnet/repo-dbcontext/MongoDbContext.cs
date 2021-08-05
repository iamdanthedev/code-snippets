using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Bonliva.ConfigurationAutoBinder;
using Domain.ConsultantWorkTime;
using Domain.CustomerInvoice.Projection.FullProjection;
using Domain.Review;
using Domain.ReviewInvitation;
using Domain.Timereport;
using Domain.Timereport.Projection;
using Domain.Timereport.Projection.FullProjection;
using Domain.Timereport.Projection.TrackingProjection;
using Framework.Events;
using MongoDB.Driver;

namespace Mongo
{
    [AutoBindConfiguration(ConfigRoot = "Mongo",
        RequiredInEnv = new[] {"Development", "Staging", "Production"})]
    public class MongoOptions
    {
        [Required] public string ConnectionString { get; set; } = "mongodb://localhost:27017/crmDB";
    }

    public class MongoDbContext
    {
        private IMongoDatabase Db { get; }
        private IMongoClient Client { get; }

        public IMongoCollection<Event> Events => Db.GetCollection<Event>("events");

        public IMongoCollection<TimereportFullProjection> TimereportFullProjections =>
            Db.GetCollection<TimereportFullProjection>("timereport_full_projection");


        public IMongoCollection<CustomerInvoiceSearchProjection> CustomerInvoiceSearchProjections =>
            Db.GetCollection<CustomerInvoiceSearchProjection>("customer_invoice_search_projection");

        public IMongoCollection<TimereportTrackingProjection> TimereportTrackingProjections =>
            Db.GetCollection<TimereportTrackingProjection>("tracking_projection");

        public IMongoCollection<TimereportReviewInvitation> Invitations =>
            Db.GetCollection<TimereportReviewInvitation>("review_invitation");

        public IMongoCollection<TimereportReview> Reviews => Db.GetCollection<TimereportReview>("review");

        public IMongoCollection<ConsultantWorkTimeEntity> ConsultantWorkTime =>
            Db.GetCollection<ConsultantWorkTimeEntity>("consultant_work_time");

        public MongoDbContext(MongoOptions options)
        {
            var dbName = MongoUrl.Create(options.ConnectionString)
                .DatabaseName;

            if (string.IsNullOrEmpty(dbName))
            {
                throw new Exception("db name is missing in mongo connection string");
            }

            Client = new MongoClient(options.ConnectionString);
            Db = Client.GetDatabase(dbName);
        }

        public async Task<IClientSessionHandle> StartSession()
        {
            return await Client.StartSessionAsync();
        }
    }
}
