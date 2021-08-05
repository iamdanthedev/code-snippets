import program from "commander";
import { parse } from "mongodb-uri";
import { MongoClient } from "mongodb";
import { MigrationManager } from "./MigrationManager";

program
  .command("migrate <connection_string_with_database> [migration_name]")
  .option("-f, --force", "Run migration even it has been run before")
  .description("Run migrations")
  .action(async (connStrWithDb, migrationName, cmdObj) => {
    try {
      if (typeof connStrWithDb !== "string") {
        throw new Error("missing connection string");
      }

      const parsedUrl = parse(connStrWithDb);

      if (!parsedUrl.database) {
        console.error("missing database name in connection string");
        process.exit(1);
      }

      const client = await MongoClient.connect(connStrWithDb);
      const db = client.db(parsedUrl.database);

      const manager = new MigrationManager(client, db);
      if (migrationName) {
        await manager.run(migrationName, !!cmdObj.force);
      } else {
        await manager.runAll();
      }
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });

program
  .command("list")
  .description("list migrations")
  .action(() => {
    const manager = new MigrationManager(null, null);
  });

program.parse(process.argv);
