const { Client } = require('pg');

async function enableExtensions() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'Jigar@123',
    database: 'vikas_inventory'
  });
  
  try {
    await client.connect();
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);
    console.log("Extensions postgis and uuid-ossp created.");
  } catch (err) {
    console.error("Error creating extensions", err);
  } finally {
    await client.end();
  }
}

enableExtensions();
