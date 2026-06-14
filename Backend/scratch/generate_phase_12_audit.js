const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://root:Jigar@123@localhost:5433/vikas_marketing",
  });
  
  try {
    await client.connect();
    
    console.log("--- PHASE 2: Distributor Example ---");
    const distRes = await client.query(`
      SELECT
          u.id AS user_id,
          d.id AS distributor_id
      FROM users u
      JOIN distributors d ON d.user_id = u.id
      LIMIT 5;
    `);
    console.log(distRes.rows);

    console.log("--- PHASE 2: Salesman Example ---");
    const salesRes = await client.query(`
      SELECT
          u.id AS user_id,
          s.id AS salesman_id
      FROM users u
      JOIN salesmen s ON s.user_id = u.id
      LIMIT 5;
    `);
    console.log(salesRes.rows);

    console.log("--- PHASE 9: Query Plan Analysis ---");
    // Explain orders query for SALESMAN
    const explainOrder = await client.query(`
      EXPLAIN ANALYZE 
      SELECT COUNT("order"."id") AS "total"
      FROM "orders" "order"
      WHERE "order"."salesman_id" IN (
        SELECT s.id FROM salesmen s WHERE s.user_id = 'test-uuid'
      )
    `);
    console.log("Orders Explain:", explainOrder.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
