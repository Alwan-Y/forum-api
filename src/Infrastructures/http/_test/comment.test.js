const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{id}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{id}/comments', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'usernameforcomment',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'comment content',
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
      const { accessToken } = await user.result.data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xx-xx-22/comments',
        payload: {
          content: 'comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 if payload no needed property', async () => {
      // Arrange
      // add user
      const server = await createServer(container);
      const addUser = await server.inject({
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
      const { accessToken } = await user.result.data;
      const { id } = await addUser.result.data.addedUser;

      // add thread
      await ThreadTableTestHelper.addThread({
        id: 'thread-xx-xx1',
        title: 'thread title',
        body: 'thread body',
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xx-xx1/comments',
        payload: {
          body: 'comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(400);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('harus mengirimkan content');
    });

    it('should response 201 and persisted comment with authentication', async () => {
      // Arrange
      // add user
      const server = await createServer(container);
      const addUser = await server.inject({
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
      const { accessToken } = await user.result.data;
      const { id } = await addUser.result.data.addedUser;

      // add thread
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(201);
      await expect(responseJson.status).toEqual('success');
      await expect(responseJson.data).toHaveProperty('addedComment');
      await expect(responseJson.data.addedComment).toHaveProperty('id');
      await expect(responseJson.data.addedComment).toHaveProperty('content');
      await expect(responseJson.data.addedComment).toHaveProperty('owner');
    });
  });

  describe('when DELETE /threads/{id}/comments/{commentId}', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'testusername',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread title',
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

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
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
          username: 'dicodingindonesia',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicodingindonesia',
          password: 'secret',
        },
      });
      const { accessToken } = await user.result.data;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-xx-xx/comments/comment-xx-xx',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 200 if authenticate and found comment', async () => {
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
      // add thread
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        owner: userId,
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
      const { accessToken } = await user.result.data;
      // add comment
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment content',
        userId,
        threadId: 'thread-123',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(200);
      await expect(responseJson.status).toEqual('success');
    });
  });
});
