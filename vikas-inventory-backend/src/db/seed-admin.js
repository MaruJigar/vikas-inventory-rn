const bcrypt = require('bcrypt');
const pool = require('./config');

async function seedAdmin() {
  console.log('Creating default admin user...');
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    await pool.query(
      `INSERT INTO users (name, phone, password_hash, role, approval_status) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (phone) DO NOTHING`,
      ['Vikas Admin', '9999999999', passwordHash, 'admin', 'approved']
    );

    console.log('✅ Default admin user created successfully!');
    console.log('Phone: 9999999999');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
