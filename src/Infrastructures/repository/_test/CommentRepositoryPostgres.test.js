const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepository postgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      const fakeIdGenerator = () => '123'; // stub
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const commentPayload = {
        content: 'great',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      // Action
      await commentRepository.addComment(commentPayload);

      // Assert
      const comments = await CommentTableTestHelper.findComment('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('comment-123');
    });

    it('should return added comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      const fakeIdGenerator = () => '123'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const commentPayload = {
        content: 'comment content',
        threadId: 'thread-123',
        owner: 'user-123',
      };

      const comment = await commentRepositoryPostgres.addComment(commentPayload);

      expect(comment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'comment content',
        owner: 'user-123',
      }));
    });
  });

  describe('findCommentById function', () => {
    it('should return InvariantError if comment not found', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.findCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'great',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.findCommentById('comment-123');

      // Assert
      expect(comment).toStrictEqual({ id: 'comment-123', owner: 'user-123' });
    });
  });

  describe('deleteComment function', () => {
    it('should return NotFoundError if comment not found', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepository.deleteCommentById('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return AuthorizationError if comment not owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'great',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkCommentOwner('comment-123', 'user-122')).rejects.toThrowError(AuthorizationError);
    });

    it('should delete comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'great',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comments = await CommentTableTestHelper.findComment('comment-123');
      expect(comments).toStrictEqual([
        {
          id: 'comment-123',
          content: 'great',
          thread_id: 'thread-123',
          owner: 'user-123',
          is_delete: true,
          created_at: expect.anything(),
          updated_at: expect.anything(),
        },
      ]);
    });
  });

  describe('findCommentsByThreadId function', () => {
    it('should return InvariantError if comment thread not found', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool);

      // Action & Assert
      await expect(commentRepository.findCommentByThreadId('thread-123')).rejects.toThrowError(InvariantError);
    });

    it('should return array of comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'great',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.findCommentByThreadId('thread-123');

      // Assert
      expect(comment).toStrictEqual([
        {
          id: 'comment-123',
          content: 'great',
          username: 'testusercoment',
          is_delete: false,
          date: expect.anything(),
        },
      ]);
    });
  });
});
