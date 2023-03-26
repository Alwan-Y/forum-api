class DeleteReplyUseCase {
  constructor({ repliesRepository }) {
    this._repliesRepository = repliesRepository;
  }

  async execute(useCasePayload) {
    await this._validatePayload(useCasePayload);
    const { replyId } = useCasePayload;

    await this._repliesRepository.findRepliesById(replyId);
    await this._repliesRepository.checkRepliesOwner(replyId, useCasePayload.owner);
    await this._repliesRepository.deleteReplies(replyId);
  }

  async _validatePayload(payload) {
    const { replyId } = payload;
    if (!replyId) {
      throw new Error('DELETE_REPLIES_USE_CASE.NOT_CONTAIN_REPLY_ID');
    }

    if (typeof replyId !== 'string') {
      throw new Error('DELETE_REPLIES_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyUseCase;
