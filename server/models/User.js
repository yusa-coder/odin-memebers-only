const pool = require('../config/database');
const bcrypt = require('bcryptjs'); // ✅ FIXED

const User = {
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_member BOOLEAN DEFAULT FALSE,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  },

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  async findById(id) {
    const query = `
      SELECT id, first_name, last_name, email, is_member, is_admin, created_at 
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  async create(firstName, lastName, email, password, isAdmin = false) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (first_name, last_name, email, password, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, email, is_member, is_admin, created_at
    `;

    const result = await pool.query(query, [
      firstName,
      lastName,
      email,
      hashedPassword,
      isAdmin
    ]);

    return result.rows[0];
  },

  async updateMembership(id, isMember) {
    const query = 'UPDATE users SET is_member = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [isMember, id]);
    return result.rows[0];
  },

  async updateAdmin(id, isAdmin) {
    const query = 'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [isAdmin, id]);
    return result.rows[0];
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
};

module.exports = User;