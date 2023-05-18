const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikesRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(like) {
    const { commentId, userId } = like;
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes_comment VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, commentId],
    };

    const result = await this._pool.query(query);

    return result;
  }

  async countLikes(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM likes_comment WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return Number(result.rows[0].count);
  }

  async removeLike(like) {
    const { commentId, userId } = like;

    const query = {
      text: 'DELETE FROM likes_comment WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async verifyLike(like) {
    const { commentId, userId } = like;

    const query = {
      text: 'SELECT id FROM likes_comment WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }
}

module.exports = LikesRepositoryPostgres;
