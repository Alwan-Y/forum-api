/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesCommentTableTestHelper = {
  async addLike({
    id = 'like-123',
    commentId,
    userId = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO likes_comment VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await pool.query(query);
  },

  async countLikes(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM likes_comment WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return Number(result.rows[0].count);
  },

  async removeLike(userId, commentId) {
    const query = {
      text: 'DELETE FROM likes_comment WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes_comment WHERE 1=1');
  },
};

module.exports = LikesCommentTableTestHelper;
