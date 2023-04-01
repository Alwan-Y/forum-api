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

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'threadId-123',
    };

    const expectedResult = new GetThread({
      id: 'threadId-123',
      title: 'title',
      body: 'body',
      date: '2021-08-08T07:26:17.018Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          content: '**komentar telah dihapus**',
          date: '2021-08-08T07:26:17.018Z',
          username: 'user-123',
          replies: expect.any(Array),
        },
        {
          id: 'comment-124',
          content: 'some content',
          date: '2021-08-08T07:26:17.018Z',
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
          date: '2021-08-08T07:26:17.018Z',
          username: 'user-123',
          is_delete: true,
        },
        {
          id: 'comment-124',
          content: 'some content',
          date: '2021-08-08T07:26:17.018Z',
          username: 'user-123',
          is_delete: false,
        },
      ]));
    mockRepliesRepository.findRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'replies-123',
        date: expect.anything(),
        content: 'sebuah balasan',
        username: 'johndoe',
      }]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
    });

    // Action
    const result = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(result).toStrictEqual(expectedResult);
    expect(mockThreadRepository.getDetailThreadById).toHaveBeenCalledWith('threadId-123');
    expect(mockCommentRepository.findCommentByThreadId).toHaveBeenCalledWith('threadId-123');
    expect(mockRepliesRepository.findRepliesByCommentId).toHaveBeenCalledWith('comment-123');
    expect(mockRepliesRepository.findRepliesByCommentId).toHaveBeenCalledWith('comment-124');
  });

  it('should map comments to expected format', async () => {
    // Arrange
    const comment1 = {
      id: 'comment-1', content: 'comment content 1', is_delete: false, date: new Date(), username: 'user1',
    };
    const comment2 = {
      id: 'comment-2', content: 'comment content 2', is_delete: true, date: new Date(), username: 'user2',
    };
    const comments = [comment1, comment2];

    const reply1 = {
      id: 'reply-1', content: 'reply content 1', is_delete: false, date: new Date(), username: 'user3',
    };
    const reply2 = {
      id: 'reply-2', content: 'reply content 2', is_delete: true, date: new Date(), username: 'user4',
    };
    const replies = [reply1, reply2];

    const repliesRepository = new RepliesRepository();
    repliesRepository.findRepliesByCommentId = jest.fn().mockReturnValue(replies);

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: null,
      commentRepository: null,
      repliesRepository,
    });

    // Act
    const result = await getDetailThreadUseCase._commentsMapping(comments);
    // Assert
    expect(result).toEqual([
      {
        id: 'comment-1',
        content: 'comment content 1',
        date: expect.anything(),
        username: 'user1',
        replies: [
          {
            id: 'reply-1',
            content: 'reply content 1',
            date: expect.anything(),
            username: 'user3',
          },
          {
            id: 'reply-2',
            content: '**balasan telah dihapus**',
            date: expect.anything(),
            username: 'user4',
          },
        ],
      },
      {
        id: 'comment-2',
        content: '**komentar telah dihapus**',
        date: expect.anything(),
        username: 'user2',
        replies: [
          {
            id: 'reply-1',
            content: 'reply content 1',
            date: expect.anything(),
            username: 'user3',
          },
          {
            id: 'reply-2',
            content: '**balasan telah dihapus**',
            date: expect.anything(),
            username: 'user4',
          },
        ],
      },
    ]);
  });

  describe('_combineTheradWithCommentAndReplies', () => {
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

  describe('GetDetailThreadUseCase', () => {
    it('returns a GetThread object with the correct properties', async () => {
      // Arrange
      const threadRepository = {
        getDetailThreadById: jest.fn().mockResolvedValue({
          id: 'thread-123',
          title: 'Test Thread',
          body: 'This is a test thread',
          date: '2023-04-02T12:00:00Z',
          username: 'testuser',
        }),
      };
      const commentRepository = {
        findCommentByThreadId: jest.fn().mockResolvedValue([
          {
            id: 'comment-1',
            content: 'This is a comment',
            date: '2023-04-02T12:01:00Z',
            username: 'testuser',
            is_delete: false,
          },
        ]),
      };
      const repliesRepository = {
        findRepliesByCommentId: jest.fn().mockResolvedValue([
          {
            id: 'reply-1',
            content: 'This is a reply',
            date: '2023-04-02T12:02:00Z',
            username: 'testuser',
            is_delete: false,
          },
        ]),
      };
      const getDetailThreadUseCase = new GetDetailThreadUseCase({
        threadRepository,
        commentRepository,
        repliesRepository,
      });

      // Act
      const result = await getDetailThreadUseCase.execute({ threadId: 'thread-123' });

      // Assert
      expect(result).toBeInstanceOf(GetThread);
      expect(result.id).toBe('thread-123');
      expect(result.title).toBe('Test Thread');
      expect(result.body).toBe('This is a test thread');
      expect(result.date).toBe('2023-04-02T12:00:00Z');
      expect(result.username).toBe('testuser');
      expect(result.comments).toBeDefined();
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].id).toBe('comment-1');
      expect(result.comments[0].content).toBe('This is a comment');
      expect(result.comments[0].date).toBe('2023-04-02T12:01:00Z');
      expect(result.comments[0].username).toBe('testuser');
      expect(result.comments[0].replies).toBeDefined();
      expect(result.comments[0].replies).toHaveLength(1);
      expect(result.comments[0].replies[0].id).toBe('reply-1');
      expect(result.comments[0].replies[0].content).toBe('This is a reply');
      expect(result.comments[0].replies[0].date).toBe('2023-04-02T12:02:00Z');
      expect(result.comments[0].replies[0].username).toBe('testuser');
    });
  });
});
