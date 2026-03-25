import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type OrderStatus = 'pending' | 'completed' | 'cancelled';

function randomDate(monthsAgo: number): Date {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const diff = now.getTime() - past.getTime();
  return new Date(past.getTime() + Math.random() * diff);
}

function getRandomStatus(): OrderStatus {
  const rand = Math.random();
  if (rand < 0.6) return 'completed'; // 60%
  if (rand < 0.85) return 'pending'; // 25%
  return 'cancelled'; // 15%
}

async function main() {
  console.log('Starting seed...');

  const existingResult = await pool.query('SELECT COUNT(*) as count FROM clients WHERE is_deleted = false');
  const existingClients = parseInt(existingResult.rows[0].count);
  
  if (existingClients >= 50) {
    console.log(`Already have ${existingClients} clients. Skipping seed.`);
    await pool.end();
    return;
  }

  console.log('Creating 50 clients with orders...');

  for (let i = 1; i <= 50; i++) {
    const createdAt = randomDate(3);
    
    const clientResult = await pool.query(
      `INSERT INTO clients (name, email, mobile, address, created_by, updated_by, created_at, updated_at, is_deleted) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, name, address, mobile`,
      [
        `Client ${i}`,
        `client${i}@example.com`,
        `+1-555-${String(i).padStart(4, '0')}`,
        `${i * 100} Main Street, City, State ${String(10000 + i)}`,
        'seed_script',
        'seed_script',
        createdAt,
        createdAt,
        false,
      ]
    );

    const client = clientResult.rows[0];

    // Create 3-10 orders per client
    const orderCount = Math.floor(Math.random() * 8) + 3;
    
    for (let j = 0; j < orderCount; j++) {
      const orderCreatedAt = new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime()));
      const status = getRandomStatus();
      
      await pool.query(
        `INSERT INTO orders (client_id, description, address, mobile, status, order_date, created_by, updated_by, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          client.id,
          `Order ${j + 1} for ${client.name}`,
          Math.random() > 0.5 ? client.address : `${Math.floor(Math.random() * 1000)} Delivery St`,
          Math.random() > 0.5 ? client.mobile : `+1-555-${Math.floor(Math.random() * 10000)}`,
          status,
          orderCreatedAt,
          'seed_script',
          'seed_script',
          orderCreatedAt,
          orderCreatedAt,
        ]
      );
    }

    if (i % 10 === 0) {
      console.log(`Created ${i} clients...`);
    }
  }

  const totalResult = await pool.query('SELECT COUNT(*) as count FROM clients WHERE is_deleted = false');
  const totalClients = parseInt(totalResult.rows[0].count);
  const ordersResult = await pool.query('SELECT COUNT(*) as count FROM orders');
  const totalOrders = parseInt(ordersResult.rows[0].count);
  
  console.log(`Seed complete! Created ${totalClients} clients and ${totalOrders} orders.`);
  await pool.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
