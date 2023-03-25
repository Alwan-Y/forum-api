class DeleteComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { threadId, commentId } = payload;

    this.threadId = threadId;
    this.commentId = commentId;
  }

  _verifyPayload(payload) {
    const { threadId, commentId } = payload;

    if (!threadId || !commentId) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteComment;
