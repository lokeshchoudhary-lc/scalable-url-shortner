process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { Pool } from "pg";
import { config } from "../core/config";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  query_timeout: 30000,
  min: 10, // Minimum number of connections in the pool
  max: 100, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30secs
  connectionTimeoutMillis: 5000, // Return error if connection fails within 5secs
});

// Error handling for database connection pool
pool.on("error", (err) => {
  console.error("Unexpected db error:", err);
});

export { pool };

export async function getDatabaseInfo(conn: Pool) {
  const client = await conn.connect();
  try {
    // Current Database
    const dbInfo = await client.query(`
      SELECT current_database() as db_name,
            current_user as current_user,
            current_schema as current_schema,
            version() as version;
    `);
    console.log("\n📊 Database Connection Info:");
    console.log("Database:", dbInfo.rows[0].db_name);
    console.log("Current User:", dbInfo.rows[0].current_user);
    console.log("Current Schema:", dbInfo.rows[0].current_schema);
    console.log("PostgreSQL Version:", dbInfo.rows[0].version);

    // List all schemas
    const schemas = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata
            ORDER BY schema_name;
        `);
    console.log("\n📁 Schemas:");
    schemas.rows.forEach((row) => console.log(`- ${row.schema_name}`));

    // Connection info
    const connectionInfo = await client.query(`
            SELECT * FROM pg_stat_activity 
            WHERE datname = current_database();
        `);
    console.log("\n🔌 Active Connections:", connectionInfo.rows.length);
  } catch (error) {
    console.error("Error getting database info:", error);
    throw error;
  } finally {
    client.release();
  }
}
