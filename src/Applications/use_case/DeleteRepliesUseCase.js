class DeleteReplyUseCase {
  constructor({ repliesRepository }) {
    this._repliesRepository = repliesRepository;
  }

  async execute(useCasePayload) {
    const { replyId } = useCasePayload;

    await this._repliesRepository.findRepliesById(replyId);
    await this._repliesRepository.checkRepliesOwner(replyId, useCasePayload.owner);
    await this._repliesRepository.deleteReplies(replyId);
  }
}

module.exports = DeleteReplyUseCase;
