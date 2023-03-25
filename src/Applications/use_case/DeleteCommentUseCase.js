const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const deleteComment = new DeleteComment(useCasePayload);
    await this._commentRepository.findCommentById(deleteComment.commentId);
    await this._commentRepository.checkCommentOwner(deleteComment.commentId, useCasePayload.owner);
    return this._commentRepository.deleteCommentById(deleteComment.commentId);
  }
}

module.exports = DeleteCommentUseCase;
