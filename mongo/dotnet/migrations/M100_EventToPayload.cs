using System;
using System.Collections.Generic;
using System.Linq;
using Mongo.Migration.Migrations.Database;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Mongo.Migration
{
    public class M100_EventToPayload : DatabaseMigration
    {
        public M100_EventToPayload() : base("1.0.0")
        {
        }

        public override void Up(IMongoDatabase db)
        {
            var eventColl = db.GetCollection<BsonDocument>("events");
            var allEvents = eventColl.Find(FilterDefinition<BsonDocument>.Empty)
                .ToList();
            var ops = new List<WriteModel<BsonDocument>>();

            allEvents.ForEach(ev =>
            {
                var oldType = (string) ev["payload"]["_t"];
                var newType = oldType.Replace("Event", "Payload");
            
                ops.Add(new UpdateOneModel<BsonDocument>(
                    Builders<BsonDocument>.Filter.Eq("_id", ev["_id"]),
                    Builders<BsonDocument>.Update.Set("payload._t", newType)
                ));
            });

            eventColl.BulkWrite(ops);
        }

        public override void Down(IMongoDatabase db)
        {
            throw new NotImplementedException();
        }
    }
}