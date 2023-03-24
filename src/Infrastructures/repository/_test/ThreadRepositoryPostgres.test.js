const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const fakeIdGenerator = () => '123'; // stub
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const threadPayload = {
        title: 'Backend Expert',
        body: 'How To Learn Backend Expert',
        owner: 'user-123',
      };

      // Action
      await threadRepository.addThread(threadPayload);

      // Assert
      const threads = await ThreadTableTestHelper.findThread('thread-123');
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toBe('thread-123');
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const fakeIdGenerator = () => '123'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const threadPayload = {
        title: 'Backend Expert',
        body: 'How To Learn Backend Expert',
        owner: 'user-123',
      };

      // Action
      const thread = await threadRepositoryPostgres.addThread(threadPayload);

      // Assert
      expect(thread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Backend Expert',
        owner: 'user-123',
      }));
    });
  });

  describe('checkThreadByTitle function', () => {
    it('should throw InvariantError when thread tittle exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ title: 'Backend Expert', body: 'How To Learn Backend Expert', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkThreadByTitle('Backend Expert')).rejects.toThrowError(InvariantError);
    });

    it('should not throw InvariantError when thread tittle not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkThreadByTitle('Backend Expert')).resolves.not.toThrowError(InvariantError);
    });
  });

  describe('getDetailThreadById', () => {
    it('should return detail thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadTableTestHelper.addThread({ title: 'Backend Expert', body: 'How To Learn Backend Expert', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getDetailThreadById('thread-123');

      // Assert
      expect(thread).toEqual({
        id: 'thread-123',
        title: 'Backend Expert',
        body: 'How To Learn Backend Expert',
        username: 'dicoding',
      });
    });

    it('should throw InvariantError when thread not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getDetailThreadById('thread-123')).rejects.toThrowError(InvariantError);
    });
  });
});
