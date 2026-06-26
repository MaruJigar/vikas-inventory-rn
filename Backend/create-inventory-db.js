const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'Jigar@123',
    database: 'postgres'
  });
  
  try {
    await client.connect();
    await client.query('CREATE DATABASE vikas_inventory;');
    console.log("Database vikas_inventory created.");
  } catch (err) {
    console.error("Error creating database", err);
  } finally {
    await client.end();
  }
}

createDb();
