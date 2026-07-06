const { Client } = require('pg');

async function listDbs() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'Jigar@123',
    database: 'postgres'
  });
  
  try {
    await client.connect();
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log("Existing databases:");
    res.rows.forEach(r => console.log(" - " + r.datname));
  } catch (err) {
    console.error("Error connecting", err);
  } finally {
    await client.end();
  }
}

listDbs();
