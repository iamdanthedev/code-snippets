import { MongoClient, Db, ObjectID } from "mongodb";
import { MongoBulkWriter } from "~/common/node";
import * as colors from "~/Migration/utils";

export default async function migrate(client: MongoClient, db: Db) {
  const name = "update consultant QualityReferences";
  const items = await db
    .collection("contacts")
    .find({})
    .project({ QualityChecks: 1, _id: 1, QualityReferences: 1 })
    .toArray();

  console.log(colors.INFO, "-- total", items.length);

  const template = {
    _id: "",
    audit: [
      {
        type: "updated",
        date: "",
        userRef: {
          Name: "DevTest1",
          PersonId: ""
        }
      }
    ],
    deleted: false,
    country: "Sweden",
    date: null,
    type: null,
    referencerId: null,
    status: null,
    name: "Referens 1",
    documentsFolder: "Referens 1"
  };

  const qualityReferences = [
    { name: "Referens 1", country: "Sweden" },
    { name: "Referens 2", country: "Sweden" },
    { name: "Referens 3", country: "Sweden" },
    { name: "Referens 1", country: "Norway" },
    { name: "Referens 2", country: "Norway" },
    { name: "Referens 3", country: "Norway" }
  ].map(x => ({
    ...template,
    _id: new ObjectID(),
    name: x.name,
    country: x.country,
    documentsFolder: x.name
  }));

  const batch = new MongoBulkWriter();

  if (items.length > 0) {
    items.forEach(x => {
      const qRefs = qualityReferences.map(q => {
        const qualityCheck = x.QualityChecks.find(
          c => c.ItemName === q.name && c.Country === q.country
        );
        if (qualityCheck) {
          return {
            ...q,
            status: qualityCheck.Status?.Type,
            date: qualityCheck.Status?.SetOn,
            audit: [
              {
                type: "updated",
                date: qualityCheck.Status?.SetOn,
                userRef: qualityCheck.Status?.SetBy
              }
            ]
          };
        }
        return { ...q, audit: [] };
      });
      batch.updateMany(
        { _id: x._id },
        {
          $set: {
            QualityReferences: qRefs
          }
        }
      );
    });

    const operations = batch.getOperations();

    await db.collection("contacts").bulkWrite(operations);
  } else {
    console.log(colors.INFO, `-- nothing matches the query for ${name}`);
  }
  console.log(colors.SUCCESS, `-- done ${name}`);
}
