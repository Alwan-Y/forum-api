const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikesCommentUseCase = require('../LikesCommentUseCase');

describe('LikesCommentUseCase', () => {
  it('should throw error if param not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const likesCommentUseCase = new LikesCommentUseCase({});

    // Action & Assert
    expect(() => likesCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if param not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      commentId: true,
      threadId: 123,
      userId: false,
    };
    const likesCommentUseCase = new LikesCommentUseCase({});

    // Action & Assert
    expect(() => likesCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if thread not found', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const likesCommentUseCase = new LikesCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(() => likesCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.THREAD_NOT_FOUND');
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith('thread-123');
  });

  it('should throw error if comment not found', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'Dicoding Indonesia Backend Expert',
        body: 'Dicoding Indonesia Backend Expert',
        date: '2021-08-08T07:26:17.000Z',
        username: 'dicodingindonesia',
      }));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const likesCommentUseCase = new LikesCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(() => likesCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.COMMENT_NOT_FOUND');
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
  });

  it('should return true if like already exist', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockLikeRepository.verifyLike = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'like-123' }));

    const likesCommentUseCase = new LikesCommentUseCase({
      likeRepository: mockLikeRepository,
    });

    // Action
    await likesCommentUseCase._isLike(useCasePayload);

    // Assert
    expect(mockLikeRepository.verifyLike).toBeCalledWith({
      commentId: 'comment-123',
      userId: 'user-123',
    });
  });

  it('should return false if like not exist', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockLikeRepository.verifyLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const likesCommentUseCase = new LikesCommentUseCase({
      likeRepository: mockLikeRepository,
    });

    // Action
    await likesCommentUseCase._isLike(useCasePayload);

    // Assert
    expect(mockLikeRepository.verifyLike).toBeCalledWith({
      commentId: 'comment-123',
      userId: 'user-123',
    });
  });

  it('should orchestrating the like add action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'Dicoding Indonesia Backend Expert',
        body: 'Dicoding Indonesia Backend Expert',
        date: '2021-08-08T07:26:17.000Z',
        username: 'dicodingindonesia',
      }));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123' }));
    mockLikeRepository.verifyLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const likesCommentUseCase = new LikesCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likesCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
    expect(mockLikeRepository.verifyLike).toBeCalledWith({
      commentId: 'comment-123',
      userId: 'user-123',
    });
    expect(mockLikeRepository.addLike).toBeCalledWith({
      commentId: 'comment-123',
      userId: 'user-123',
    });
  });

  it('should orchestrating the like remove action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'Dicoding Indonesia Backend Expert',
        body: 'Dicoding Indonesia Backend Expert',
        date: '2021-08-08T07:26:17.000Z',
        username: 'dicodingindonesia',
      }));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-123' }));
    mockLikeRepository.verifyLike = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'like-123' }));
    mockLikeRepository.removeLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const likesCommentUseCase = new LikesCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likesCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
    expect(mockLikeRepository.verifyLike).toBeCalledWith({
      commentId: 'comment-123',
      userId: 'user-123',
    });
    expect(mockLikeRepository.removeLike).toBeCalledWith({
      commentId: 'comment-123',
      userId: 'user-123',
    });
  });
});
