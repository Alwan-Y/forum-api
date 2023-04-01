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
});
