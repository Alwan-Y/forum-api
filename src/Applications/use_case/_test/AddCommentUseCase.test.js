const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should throw error if payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Dicoding Indonesia Backend Expert',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // Action & Assert
    await expect(new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    }).execute(useCasePayload)).rejects.toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if thread id not found', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'Dicoding Indonesia Backend Expert',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('THREAD.NOT_FOUND')));

    // Action & Assert
    await expect(new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    }).execute(useCasePayload)).rejects.toThrowError('THREAD.NOT_FOUND');
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = new AddComment({
      threadId: 'thread-123',
      content: 'Dicoding Indonesia Backend Expert',
      owner: 'user-123',
    });

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'Dicoding Indonesia Backend Expert',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const response = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(response).toStrictEqual(expectedAddedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(useCasePayload);
  });
});
