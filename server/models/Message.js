const pool = require('../config/database');

const Message = {
  // Create messages table if not exists
  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
  },

  // Create new message
  async create(title, text, authorId) {
    const query = `
      INSERT INTO messages (title, text, author_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [title, text, authorId]);
    return result.rows[0];
  },

  // Get all messages with author info
  async getAll() {
    const query = `
      SELECT m.id, m.title, m.text, m.created_at,
             u.first_name, u.last_name, u.email,
             u.is_member as author_is_member, u.is_admin as author_is_admin
      FROM messages m
      JOIN users u ON m.author_id = u.id
      ORDER BY m.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Get message by ID
  async getById(id) {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Delete message
  async delete(id) {
    const query = 'DELETE FROM messages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = Message;
