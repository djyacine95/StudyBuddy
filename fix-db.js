// fix-db.js
import pg from 'pg';
const { Client } = pg;

// 1. Get this from Render Dashboard > Database > Connect > External Connection String
// Paste it inside the quotes below:
const connectionString = "postgresql://studybuddy_db_fgwx_user:e6w0kAdmECc4GY4vEqCvvc2Xu3CtNy0M@dpg-d4h3eb95pdvs739035tg-a.oregon-postgres.render.com/studybuddy_db_fgwx"; 

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false } // Required for Render
});

async function fix() {
  try {
    await client.connect();
    console.log("Connected to database...");

    // Delete the stuck index and the old session table
    console.log("Dropping stuck index and table...");
    await client.query('DROP INDEX IF EXISTS "IDX_session_expire";');
    await client.query('DROP TABLE IF EXISTS "session";');
    await client.query('DROP TABLE IF EXISTS "user_sessions";'); // Clean up any other attempts

    console.log("✅ Database cleaned! You can now redeploy.");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.end();
  }
}

fix();