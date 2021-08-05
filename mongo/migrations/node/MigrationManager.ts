/* eslint-disable @typescript-eslint/no-var-requires */
import { ObjectID, MongoClient, Db } from "mongodb";
import { readdirSync } from "fs";
import { resolve } from "path";
import {
  IMigrationManager,
  MigrationHandler,
  MigrationDescription
} from "./IMigrationManager";

const MIGRATION_COLLECTION = "migrations";

interface MongoMigrationRecord {
  _id: ObjectID;
  version: string;
  runOn: Date | null;
}

export class MigrationManager implements IMigrationManager {
  private migrations: MigrationDescription[] = [];

  constructor(private readonly mongoClient: MongoClient, private readonly db: Db) {
    this.discover();
  }

  register(version: string, handler: MigrationHandler) {
    this.migrations.push({ version, handler });
  }

  async runAll() {
    const history = await this.getHistory();

    for (const migration of this.migrations) {
      await this.runMigration(migration, history);
    }

    console.info("done");
  }

  async run(version: string, force: boolean) {
    const migration = this.migrations.find(x => x.version === version);
    const history = await this.getHistory();

    if (!migration) {
      throw new Error(`cannot find migration ${version}`);
    }

    return this.runMigration(migration, history, force);
  }

  private async runMigration(
    migration: MigrationDescription,
    history: MongoMigrationRecord[],
    force = false
  ) {
    const historyRecord = history.find(x => x.version === migration.version);
    const hasRun = !!historyRecord?.runOn;

    if (hasRun && !force) {
      console.info(`${migration.version}: skipping`);
      return;
    }

    console.info(`${migration.version}: running`);
    await migration.handler(this.mongoClient, this.db);
    await this.setRunComplete(migration.version);
  }

  discover() {
    const migrationsDir = resolve(__dirname, "migrations");
    const files = readdirSync(migrationsDir);

    for (const file of files) {
      const handler = require(resolve(migrationsDir, file)).default;
      const version = file.split(".ts")[0];
      console.info(`Discovered migration ${version}`);
      this.register(version, handler);
    }
  }

  getHistory() {
    return this.db
      .collection(MIGRATION_COLLECTION)
      .find<MongoMigrationRecord>()
      .toArray();
  }

  async setRunComplete(version: string) {
    const runOn = new Date();

    await this.db.collection(MIGRATION_COLLECTION).updateOne(
      { version },
      {
        $set: { runOn },
        $setOnInsert: {
          version
        }
      },
      {
        upsert: true
      }
    );
  }
}
