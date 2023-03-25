const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should throw error if payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    // Action & Assert
    await expect(new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    }).execute(useCasePayload)).rejects.toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if comment id not found', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.reject(new Error('COMMENT.NOT_FOUND')));

    // Action & Assert
    await expect(new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    }).execute(useCasePayload)).rejects.toThrowError('COMMENT.NOT_FOUND');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = new DeleteComment({
      commentId: 'comment-123',
      threadId: 'thread-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.checkCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Action
    await new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    }).execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.findCommentById).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.checkCommentOwner)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(useCasePayload.commentId);
  });
});
