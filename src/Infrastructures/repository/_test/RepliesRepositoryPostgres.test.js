const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const RepliesRepositoryPostgres = require('../RepliesRepositoryPostgres');
const AddedReplies = require('../../../Domains/replies/entities/AddedReplies');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('RepliesRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123', content: 'great thread', threadId: 'thread-123', userId: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, fakeIdGenerator);
      const replyPayload = {
        content: 'great reply',
        commentId: 'comment-123',
        owner: 'user-123',
      };

      // Action
      await repliesRepositoryPostgres.addReplies(replyPayload);

      // Assert
      const replies = await RepliesTableTestHelper.findReply('replies-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBe('replies-123');
    });

    it('should return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123', content: 'great thread', threadId: 'thread-123', userId: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, fakeIdGenerator);
      const replyPayload = {
        content: 'great reply',
        commentId: 'comment-123',
        owner: 'user-123',
      };

      // Action
      const reply = await repliesRepositoryPostgres.addReplies(replyPayload);

      // Assert
      expect(reply).toStrictEqual(new AddedReplies({
        id: 'replies-123',
        content: 'great reply',
        owner: 'user-123',
      }));
    });
  });

  describe('findRepliesById function', () => {
    it('should return replies correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123', content: 'great thread', threadId: 'thread-123', userId: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'replies-123', content: 'great reply', commentId: 'comment-123', userId: 'user-123',
      });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action
      const replies = await repliesRepositoryPostgres.findRepliesById('replies-123');
      // Assert
      expect(replies).toStrictEqual({
        id: 'replies-123',
        owner: 'user-123',
      });
    });

    it('should throw NotFoundError when replies not found', async () => {
      // Arrange
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(repliesRepositoryPostgres.findRepliesById('replies-123')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('deleteReplies function', () => {
    it('should persist delete replies', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123', content: 'great thread', threadId: 'thread-123', userId: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'replies-123', content: 'great reply', commentId: 'comment-123', userId: 'user-123',
      });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action
      await repliesRepositoryPostgres.deleteReplies('replies-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReply('replies-123');
      expect(replies).toStrictEqual([{
        id: 'replies-123',
        content: 'great reply',
        comment_id: 'comment-123',
        owner: 'user-123',
        is_delete: true,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      }]);
    });

    it('should throw NotFoundError when replies not found', async () => {
      // Arrange
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(repliesRepositoryPostgres.deleteReplies('replies-123')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('findRepliesByCommentId function', () => {
    it('should return Array null if replies not found', async () => {
      // Arrange
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      const result = await repliesRepositoryPostgres.findRepliesByCommentId('comment-123');

      // Action & Assert
      await expect(result).toEqual([]);
    });

    it('should return replies correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123', content: 'great thread', threadId: 'thread-123', userId: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'replies-123', content: 'great reply', commentId: 'comment-123', userId: 'user-123',
      });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action
      const replies = await repliesRepositoryPostgres.findRepliesByCommentId('comment-123');
      // Assert
      expect(replies).toStrictEqual([{
        id: 'replies-123',
        content: 'great reply',
        date: expect.anything(),
        username: 'testusercoment',
        is_delete: false,
      }]);
    });
  });

  describe('checkRepliesOwner function', () => {
    it('should return AuthorizationError when replies not owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123', content: 'great thread', threadId: 'thread-123', userId: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'replies-123', content: 'great reply', commentId: 'comment-123', userId: 'user-123',
      });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(repliesRepositoryPostgres.checkRepliesOwner('replies-123', 'user-122')).rejects.toThrowError(AuthorizationError);
    });

    it('should not return AuthorizationError when replies owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'testusercoment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-123', title: 'comment tittle', owner: 'user-123' });
      await CommentTableTestHelper.addComment({
        id: 'comment-123', content: 'great thread', threadId: 'thread-123', userId: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'replies-123', content: 'great reply', commentId: 'comment-123', userId: 'user-123',
      });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(repliesRepositoryPostgres.checkRepliesOwner('replies-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });
});
