const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const LikesCommentTableTestHelper = require('../../../../tests/LikesCommentTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await LikesCommentTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return 401 unauthorized ', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({
        username: 'testusername',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-1221',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment testing',
        userId: 'user-123',
        threadId: 'thread-1221',
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-1221/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should return 404 not found when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({
        username: 'testusername',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-1221',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment testing',
        userId: 'user-123',
        threadId: 'thread-1221',
      });

      // adding user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusernamelikes',
          password: 'secret',
          fullname: 'dicoding',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusernamelikes',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-1222/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should return 404 not found when comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({
        username: 'testusername',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-1221',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment testing',
        userId: 'user-123',
        threadId: 'thread-1221',
      });

      // adding user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusernamelikes',
          password: 'secret',
          fullname: 'dicoding',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusernamelikes',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-1221/comments/comment-124/likes',
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should return 200 success when like comment success', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({
        username: 'testusername',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-1221',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment testing',
        userId: 'user-123',
        threadId: 'thread-1221',
      });

      // adding user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusernamelikes',
          password: 'secret',
          fullname: 'dicoding',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusernamelikes',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-1221/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
