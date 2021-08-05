using Domain.Timereport.Projection.FullProjection;
using Mongo.Migration.Migrations.Database;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Mongo.Migration
{
    public class M101_Expenses : DatabaseMigration
    {
        public M101_Expenses() : base("1.0.1")
        {
        }

        public override void Up(IMongoDatabase db)
        {
            var projColl = db.GetCollection<BsonDocument>("timereport_full_projection");
            var update = Builders<BsonDocument>.Update.Set("totalExpenses", 0M);
            projColl.UpdateMany(FilterDefinition<BsonDocument>.Empty, update);
        }

        public override void Down(IMongoDatabase db)
        {
            throw new System.NotImplementedException();
        }
    }
}