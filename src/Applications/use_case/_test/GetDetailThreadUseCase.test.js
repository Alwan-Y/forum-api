const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');

describe('GetDetailThreadUseCase', () => {
  it('should throw if not contain threadId', () => {
    // Arrange
    const useCase = new GetDetailThreadUseCase({});

    // Action & Assert
    expect(useCase.execute({}))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw if payload not meet data type specification', () => {
    // Arrange
    const useCase = new GetDetailThreadUseCase({});

    // Action & Assert
    expect(useCase.execute({ threadId: 121 }))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if use case thread id not found', () => {
    // Arrange
    const useCasePayload = {
      threadId: 'threadId',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    expect(() => getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND');
    expect(mockThreadRepository.checkThreadById).toHaveBeenCalledWith('threadId');
  });

  describe('_combineTheradWithCommentAndReplies', () => {
    it('should map comments when comments exist', async () => {
      // Arrange
      const thread = {
        id: 'thread-id',
        title: 'title',
        body: 'body',
        date: '2022-01-01T00:00:00.000Z',
        username: 'username',
      };
      const comments = [
        {
          id: 'comment-id-1',
          content: 'comment 1',
          date: '2022-01-02T00:00:00.000Z',
          username: 'user1',
          is_delete: false,
        },
        {
          id: 'comment-id-2',
          content: 'comment 2',
          date: '2022-01-03T00:00:00.000Z',
          username: 'user2',
          is_delete: true,
        },
      ];

      const mockRepliesRepository = new RepliesRepository();

      mockRepliesRepository.findRepliesByCommentId = jest.fn()
        .mockImplementation(() => Promise.resolve([]));

      const useCase = new GetDetailThreadUseCase({
        threadRepository: null,
        commentRepository: null,
        repliesRepository: mockRepliesRepository,
      });

      // Action
      const result = await useCase._combineTheradWithComment({ thread, comments });

      // Assert
      expect(result.id).toEqual(thread.id);
      expect(result.title).toEqual(thread.title);
      expect(result.body).toEqual(thread.body);
      expect(result.date).toEqual(thread.date);
      expect(result.username).toEqual(thread.username);
      expect(result.comments).toEqual([
        {
          id: comments[0].id,
          content: comments[0].content,
          date: comments[0].date,
          username: comments[0].username,
          replies: expect.any(Array),
        },
        {
          id: comments[1].id,
          content: '**komentar telah dihapus**',
          date: comments[1].date,
          username: comments[1].username,
          replies: expect.any(Array),
        },
      ]);
    });

    it('should not map comments when comments is empty', async () => {
      // Arrange
      const thread = {
        id: 'thread-id',
        title: 'title',
        body: 'body',
        date: '2022-01-01T00:00:00.000Z',
        username: 'username',
      };
      const comments = [];
      const useCase = new GetDetailThreadUseCase({
        threadRepository: null,
        commentRepository: null,
      });

      // Act
      const result = await useCase._combineTheradWithComment({ thread, comments });

      // Assert
      expect(result.id).toEqual(thread.id);
      expect(result.title).toEqual(thread.title);
      expect(result.body).toEqual(thread.body);
      expect(result.date).toEqual(thread.date);
      expect(result.username).toEqual(thread.username);
      expect(result.comments).toBeUndefined();
    });
  });

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'threadId-123',
    };

    const expectedResult = new GetThread({
      id: 'threadId-123',
      title: 'title',
      body: 'body',
      date: expect.any(String),
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          content: '**komentar telah dihapus**',
          date: expect.any(String),
          username: 'user-123',
          replies: expect.any(Array),
        },
        {
          id: 'comment-124',
          content: 'some content',
          date: expect.any(String),
          username: 'user-123',
          replies: expect.any(Array),
        },
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'threadId-123' }));
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'threadId-123',
        title: 'title',
        body: 'body',
        date: '2021-08-08T07:26:17.018Z',
        username: 'dicoding',
      }));
    mockCommentRepository.findCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          content: 'comment content',
          date: expect.any(String),
          username: 'user-123',
          is_delete: true,
        },
        {
          id: 'comment-124',
          content: 'some content',
          date: expect.any(String),
          username: 'user-123',
          is_delete: false,
        },
      ]));
    mockRepliesRepository.findRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
    });

    // Action
    const result = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(result).toStrictEqual(expectedResult);
    expect(mockThreadRepository.checkThreadById).toHaveBeenCalledWith('threadId-123');
    expect(mockThreadRepository.getDetailThreadById).toHaveBeenCalledWith('threadId-123');
    expect(mockCommentRepository.findCommentByThreadId).toHaveBeenCalledWith('threadId-123');
    expect(mockCommentRepository.findCommentByThreadId).toHaveBeenCalledWith('threadId-123');
  });
});
