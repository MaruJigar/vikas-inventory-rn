const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
  });
  
  try {
    await client.connect();
    console.log("Connected to postgres");
    
    // Drop existing if any, to ensure empty
    await client.query(`DROP DATABASE IF EXISTS vikas_baseline`);
    await client.query(`CREATE DATABASE vikas_baseline`);
    console.log("Database vikas_baseline created.");
  } catch (err) {
    console.error("Error creating database", err);
  } finally {
    await client.end();
  }

  // Now connect to the new db and create postgis
  const client2 = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5432/vikas_baseline",
  });
  try {
    await client2.connect();
    await client2.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await client2.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    console.log("Extensions created in vikas_baseline.");
  } catch (err) {
    console.error("Error creating extensions", err);
  } finally {
    await client2.end();
  }
}

createDb();
