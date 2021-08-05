import { MongoClient, Db } from "mongodb";
import { trim } from "lodash";
import { forEachInQueue } from "../../common/repeatInQueue";

export default async function migrate(client: MongoClient, db: Db) {
  const consultants: any[] = await db
    .collection("contacts")
    .find({})
    .project({ _id: 1, HPRNumber: 1 })
    .toArray();

  await forEachInQueue(
    consultants,
    (item, index) => {
      console.info(`${index}/${consultants.length}`);
      return db.collection("contacts").updateOne(
        { _id: item._id },
        {
          $set: {
            "search.HPRNumberExists": !!trim(item.HPRNumber)
          }
        }
      );
    },
    {
      concurrency: 20
    }
  );
}
