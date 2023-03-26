const AddedReplies = require('../../Domains/replies/entities/AddedReplies');
const RepliesRepository = require('../../Domains/replies/RepliesRepository');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class RepliesRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReplies(replies) {
    const {
      content, commentId, owner,
    } = replies;
    const id = `replies-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, commentId, owner],
    };

    const result = await this._pool.query(query);

    return new AddedReplies({ ...result.rows[0] });
  }

  async findRepliesById(id) {
    const query = {
      text: 'SELECT id, owner FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('replies tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteReplies(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('replies gagal dihapus');
    }
  }

  async checkRepliesOwner(id, ownerReplies) {
    const { owner } = await this.findRepliesById(id);

    if (owner !== ownerReplies) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async findRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT replies.id, replies.content, replies.created_at as date, users.username
        FROM replies
        LEFT JOIN users ON users.id = replies.owner
        WHERE replies.comment_id = $1
        ORDER BY replies.created_at ASC
        `,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('replies tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = RepliesRepositoryPostgres;
