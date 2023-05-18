const LikesCommentUseCase = require('../../../../Applications/use_case/LikesCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikesCommentHandler = this.putLikesCommentHandler.bind(this);
  }

  async putLikesCommentHandler(request) {
    const likesCommentUseCase = this._container.getInstance(LikesCommentUseCase.name);

    const useCasePayload = {
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      userId: request.auth.credentials.id,
    };

    await likesCommentUseCase.execute(useCasePayload);

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
