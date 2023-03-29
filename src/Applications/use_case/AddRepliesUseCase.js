const AddReplies = require('../../Domains/replies/entities/AddReplies');

class AddRepliesUseCase {
  constructor({ repliesRepository, commentRepository, threadRepository }) {
    this._repliesRepository = repliesRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    const {
      content, commentId, owner, threadId,
    } = payload;

    const addReplies = new AddReplies({ content });
    await this._threadRepository.getDetailThreadById(threadId);
    await this._commentRepository.findCommentById(commentId);
    return this._repliesRepository.addReplies({ ...addReplies, commentId, owner });
  }
}

module.exports = AddRepliesUseCase;
