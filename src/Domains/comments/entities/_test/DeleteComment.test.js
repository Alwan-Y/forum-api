const DeleteComment = require('../DeleteComment');

describe('DeleteComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      threadId: 'thread-123',
    };

    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      threadId: 123123,
      commentId: 'comment-123',
    };

    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeleteComment entities correctly', () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const deleteComment = new DeleteComment(payload);

    expect(deleteComment).toBeInstanceOf(DeleteComment);
    expect(deleteComment.threadId).toEqual(payload.threadId);
    expect(deleteComment.commentId).toEqual(payload.commentId);
  });
});
