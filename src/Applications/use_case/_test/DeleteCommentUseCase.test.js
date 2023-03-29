const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = new DeleteComment({
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'commentId', owner: 'user-123' }));

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
