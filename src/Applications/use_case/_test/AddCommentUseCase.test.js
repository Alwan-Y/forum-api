const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
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
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'Dicoding Indonesia Backend Expert',
        body: 'Dicoding Indonesia Backend Expert',
        date: '2021-08-08T07:26:17.000Z',
        username: 'dicodingindonesia',
      }));
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: 'Dicoding Indonesia Backend Expert',
        owner: 'user-123',
      })));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const response = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(response).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(useCasePayload);
  });
});
