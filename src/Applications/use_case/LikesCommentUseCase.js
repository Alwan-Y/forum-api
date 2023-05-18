class LikesCommentUseCase {
  constructor({
    likeRepository,
    commentRepository,
    threadRepository,
  }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._verifyPayload(useCasePayload);
    const { commentId, userId } = useCasePayload;

    const isLike = await this._isLike({ commentId, userId });

    if (isLike) {
      await this._likeRepository.removeLike({ commentId, userId });
      return;
    }

    await this._likeRepository.addLike({ commentId, userId });
  }

  async _verifyPayload({ commentId, threadId }) {
    if (!commentId || !threadId) {
      throw new Error('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof threadId !== 'string') {
      throw new Error('LIKE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const thread = await this._threadRepository.getDetailThreadById(threadId);

    if (!thread) {
      throw new Error('LIKE_COMMENT_USE_CASE.THREAD_NOT_FOUND');
    }

    const comment = await this._commentRepository.findCommentById(commentId);

    if (!comment) {
      throw new Error('LIKE_COMMENT_USE_CASE.COMMENT_NOT_FOUND');
    }
  }

  async _isLike({ commentId, userId }) {
    return this._likeRepository.verifyLike({ commentId, userId });
  }
}

module.exports = LikesCommentUseCase;
