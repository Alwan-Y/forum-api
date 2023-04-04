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
        date: '2021-08-08T07:26:17.018Z',
        content: 'sebuah balasan',
        username: 'johndoe',
        is_delete: false,
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

  describe('_combineTheradWithComment', () => {
    it('should combine thread with comments', async () => {
      // Arrange
      const thread = {
        id: 'thread-id',
        title: 'Thread Title',
        body: 'Thread Body',
        date: new Date(),
        username: 'username',
      };
      const comments = [
        {
          id: 'comment-id-1',
          content: 'Comment Content 1',
          is_delete: false,
          date: new Date(),
          username: 'username1',
        },
        {
          id: 'comment-id-2',
          content: 'Comment Content 2',
          is_delete: true,
          date: new Date(),
          username: 'username2',
        },
      ];
      const replies = [
        {
          id: 'reply-id-1',
          content: 'Reply Content 1',
          is_delete: false,
          date: new Date(),
          username: 'username1',
        },
        {
          id: 'reply-id-2',
          content: 'Reply Content 2',
          is_delete: true,
          date: new Date(),
          username: 'username2',
        },
      ];
      const repliesRepository = {
        findRepliesByCommentId: jest.fn().mockResolvedValue(replies),
      };
      const useCase = new GetDetailThreadUseCase({
        threadRepository: null,
        commentRepository: null,
        repliesRepository,
      });

      // Act
      const result = await useCase._combineTheradWithComment({ thread, comments });

      // Assert
      expect(result).toEqual({
        id: 'thread-id',
        title: 'Thread Title',
        body: 'Thread Body',
        date: thread.date,
        username: 'username',
        comments: [
          {
            id: 'comment-id-1',
            content: 'Comment Content 1',
            date: comments[0].date,
            username: 'username1',
            replies: [
              {
                id: 'reply-id-1',
                content: 'Reply Content 1',
                date: replies[0].date,
                username: 'username1',
              },
              {
                content: '**balasan telah dihapus**',
                date: replies[1].date,
                id: 'reply-id-2',
                username: 'username2',
              },
            ],
          },
          {
            id: 'comment-id-2',
            content: '**komentar telah dihapus**',
            date: comments[1].date,
            username: 'username2',
            replies: [
              {
                id: 'reply-id-1',
                content: 'Reply Content 1',
                date: replies[0].date,
                username: 'username1',
              },
              {
                id: 'reply-id-2',
                content: '**balasan telah dihapus**',
                date: replies[1].date,
                username: 'username2',
              },
            ],
          },
        ],
      });
      expect(repliesRepository.findRepliesByCommentId).toHaveBeenCalledTimes(2);
      expect(repliesRepository.findRepliesByCommentId).toHaveBeenNthCalledWith(1, 'comment-id-1');
      expect(repliesRepository.findRepliesByCommentId).toHaveBeenNthCalledWith(2, 'comment-id-2');
    });
  });
});
