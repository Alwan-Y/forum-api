const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread with authentication', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      const server = await createServer(container);
      // add user
      const addUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });
      const { accessToken } = await user.result.data;
      const { id } = await addUser.result.data.addedUser;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test title',
          body: 'thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(201);
      await expect(responseJson.status).toEqual('success');
      await expect(responseJson.data.addedThread.id).toBeDefined();
      await expect(responseJson.data.addedThread.title).toEqual('test title');
      await expect(responseJson.data.addedThread.owner).toEqual(id);
    });
  });

  describe('when GET /threads/{id}', () => {
    it('should response detail thread with comments without authentication', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'testusername',
        id: 'user-123',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        title: 'test title',
        body: 'thread body',
        owner: 'user-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'comment content',
        threadId: 'thread-123',
        userId: 'user-123',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(200);
      await expect(responseJson.status).toEqual('success');
      await expect(responseJson.data.thread.id).toEqual('thread-123');
      await expect(responseJson.data.thread.title).toEqual('test title');
      await expect(responseJson.data.thread.body).toEqual('thread body');
      await expect(responseJson.data.thread.username).toEqual('testusername');
      await expect(responseJson.data.thread.comments).toBeDefined();
      await expect(responseJson.data.thread.comments.length).toEqual(1);
      await expect(responseJson.data.thread.comments[0].id).toEqual('comment-123');
      await expect(responseJson.data.thread.comments[0].content).toEqual('comment content');
      await expect(responseJson.data.thread.comments[0].username).toEqual('testusername');
    });
  });
});
