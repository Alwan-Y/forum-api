/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'great thread',
    threadId,
    userId = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO comment_threads VALUES($1, $2, $3, $4)',
      values: [id, content, threadId, userId],
    };

    await pool.query(query);
  },

  async findComment(id) {
    const query = {
      text: 'SELECT * FROM comment_threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_threads WHERE 1=1');
  },
};

module.exports = CommentTableTestHelper;
