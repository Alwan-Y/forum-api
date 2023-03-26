const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/thread/{id}/comments/{id}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{id}/comments/{id}/replies', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
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
        id: 'user-123',
        content: 'comment testing',
        userId: 'user-123',
        threadId: 'thread-1221',
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {
          content: 'reply content',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusername',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusername',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {
          content: 'reply content',
        },
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 if comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'user-123',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusername',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusername',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {
          content: 'reply content',
        },
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 201 and persisted comment with authentication', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'user-123',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment content',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusername',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusername',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {
          content: 'reply content',
        },
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(201);
      await expect(responseJson.status).toEqual('success');
      await expect(responseJson.data).toHaveProperty('addedReply');
      await expect(responseJson.data.addedReply).toHaveProperty('id');
      await expect(responseJson.data.addedReply).toHaveProperty('content');
      await expect(responseJson.data.addedReply).toHaveProperty('owner');
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 401 if not authenticated', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'user-123',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment content',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'replies-123',
        content: 'reply content',
        userId: 'user-123',
        commentId: 'comment-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/replies-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusername',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusername',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/xxx/comments/comment-123/replies/replies-123',
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('replies tidak ditemukan');
    });

    it('should response 404 if comment not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'user-123',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusername',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusername',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/xxx/replies/replies-123',
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('replies tidak ditemukan');
    });

    it('should response 404 if reply not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'user-123',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment content',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusername',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusername',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/xxx',
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('replies tidak ditemukan');
    });

    it('should response 403 if reply found but not owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'user-123',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test tittle',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment content',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'replies-123',
        content: 'reply content',
        userId: 'user-123',
        commentId: 'comment-123',
      });
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusername',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusername',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/replies-123',
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(403);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });

    it('should response 200 if reply found and owner', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      const users = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'testusername',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const userId = await users.result.data.addedUser.id;
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test tittle',
        body: 'thread body',
        owner: userId,
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment content',
        userId,
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'replies-123',
        content: 'reply content',
        userId,
        commentId: 'comment-123',
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'testusername',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/replies-123',
        headers: {
          Authorization: `Bearer ${user.result.data.accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(200);
      await expect(responseJson.status).toEqual('success');
    });
  });
});
