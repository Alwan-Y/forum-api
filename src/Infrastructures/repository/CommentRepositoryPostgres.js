const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const {
      content, threadId, owner,
    } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_threads VALUES ($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async findCommentById(id) {
    const query = {
      text: 'SELECT id, owner FROM comment_threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comment_threads SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment gagal dihapus');
    }
  }

  async checkCommentOwner(id, ownerComent) {
    const { owner } = await this.findCommentById(id);

    if (owner !== ownerComent) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async findCommentByThreadId(threadId) {
    const query = {
      text: `SELECT comment_threads.id, comment_threads.content, 
      comment_threads.is_delete, users.username, comment_threads.created_at as date
      FROM comment_threads
      LEFT JOIN users ON comment_threads.owner = users.id
      WHERE comment_threads.thread_id = $1
      order by comment_threads.created_at`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('comment tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
