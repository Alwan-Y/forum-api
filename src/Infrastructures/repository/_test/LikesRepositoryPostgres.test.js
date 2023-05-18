const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const LikesCommentTableTestHelper = require('../../../../tests/LikesCommentTableTestHelper');
const LikesRepositoryPostgres = require('../LikesRepositoryPostgres');

describe('LikesRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await LikesCommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist add like', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'like-user-123', username: 'likeUser' });
      await ThreadTableTestHelper.addThread({ id: 'like-thread-123', title: 'thread title', owner: 'like-user-123' });
      await CommentTableTestHelper.addComment({
        id: 'like-comment-123', content: 'comment content', threadId: 'like-thread-123', userId: 'like-user-123',
      });

      const fakeIdGenerator = () => 123; // stub!
      const likeRepository = new LikesRepositoryPostgres(pool, fakeIdGenerator);
      const likePayload = {
        commentId: 'like-comment-123',
        userId: 'like-user-123',
      };

      // Action
      await likeRepository.addLike(likePayload);

      // Assert
      const likes = await LikesCommentTableTestHelper.countLikes('like-comment-123');
      expect(likes).toStrictEqual(1);
    });
  });

  describe('countLikes function', () => {
    it('should return count likes correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'like-user-123', username: 'likeUser' });
      await ThreadTableTestHelper.addThread({ id: 'like-thread-123', title: 'thread title', owner: 'like-user-123' });
      await CommentTableTestHelper.addComment({
        id: 'like-comment-123', content: 'comment content', threadId: 'like-thread-123', userId: 'like-user-123',
      });
      await LikesCommentTableTestHelper.addLike({
        commentId: 'like-comment-123',
        userId: 'like-user-123',
      });

      const fakeIdGenerator = () => 123; // stub!
      const likeRepository = new LikesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const likes = await likeRepository.countLikes('like-comment-123');

      // Assert
      expect(likes).toStrictEqual(1);
    });
  });

  describe('deleteLike function', () => {
    it('should persist delete like', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'like-user-123', username: 'likeUser' });
      await ThreadTableTestHelper.addThread({ id: 'like-thread-123', title: 'thread title', owner: 'like-user-123' });
      await CommentTableTestHelper.addComment({
        id: 'like-comment-123', content: 'comment content', threadId: 'like-thread-123', userId: 'like-user-123',
      });

      const payload = {
        commentId: 'like-comment-123',
        userId: 'like-user-123',
      };

      await LikesCommentTableTestHelper.addLike(payload);

      const fakeIdGenerator = () => 123; // stub!
      const likeRepository = new LikesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepository.removeLike(payload);

      // Assert
      const likes = await LikesCommentTableTestHelper.countLikes('like-comment-123');
      expect(likes).toStrictEqual(0);
    });
  });

  describe('verifyLike function', () => {
    it('should return like when like is exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'like-user-123', username: 'likeUser' });
      await ThreadTableTestHelper.addThread({ id: 'like-thread-123', title: 'thread title', owner: 'like-user-123' });
      await CommentTableTestHelper.addComment({
        id: 'like-comment-123', content: 'comment content', threadId: 'like-thread-123', userId: 'like-user-123',
      });

      const payload = {
        commentId: 'like-comment-123',
        userId: 'like-user-123',
      };

      await LikesCommentTableTestHelper.addLike(payload);

      const fakeIdGenerator = () => 123; // stub!
      const likeRepository = new LikesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const like = await likeRepository.verifyLike(payload);

      // Assert
      expect(like).toStrictEqual({ id: 'like-123' });
    });
  });
});
