const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplies = require('../../../Domains/replies/entities/AddReplies');
const AddedReplies = require('../../../Domains/replies/entities/AddedReplies');
const AddRepliesUseCase = require('../AddRepliesUseCase');

describe('AddRepliesUseCase', () => {
  it('should orchestrating the add replies action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: new AddReplies({ content: 'Dicoding Indonesia Backend Expert' }).content,
      owner: 'user-123',
    };

    const expectedAddedReplies = new AddedReplies({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(
        {
          id: 'thread-123',
          title: 'Dicoding Indonesia Backend Expert',
          body: 'Dicoding Indonesia Backend Expert',
          date: '2021-08-08T07:26:17.000Z',
          username: 'dicodingindonesia',
        },
      ));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'commentId' }));
    mockRepliesRepository.addReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedReplies({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: 'user-123',
      })));

    const addRepliesUseCase = new AddRepliesUseCase({
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReplies = await addRepliesUseCase.execute(useCasePayload);

    // Assert
    expect(addedReplies).toStrictEqual(expectedAddedReplies);
    expect(mockThreadRepository.getDetailThreadById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith('comment-123');
    expect(mockRepliesRepository.addReplies).toHaveBeenCalledWith({
      content: 'Dicoding Indonesia Backend Expert',
      commentId: 'comment-123',
      owner: 'user-123',
    });
  });
});
