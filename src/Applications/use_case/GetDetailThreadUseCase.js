const GetThread = require('../../Domains/threads/entities/GetThread');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, repliesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._repliesRepository = repliesRepository;
  }

  async execute(payload) {
    await this._validatePayload(payload);
    const { threadId } = payload;

    const thread = await this._threadRepository.getDetailThreadById(threadId);
    const comments = await this._commentRepository.findCommentByThreadId(threadId);
    const result = await this._combineTheradWithComment({ thread, comments });

    return new GetThread(result);
  }

  async _validatePayload(payload) {
    const { threadId } = payload;

    if (!threadId) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const result = await this._threadRepository.checkThreadById(threadId);

    if (!result) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND');
    }
  }

  async _combineTheradWithComment({ thread, comments }) {
    const result = {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
    };

    if (comments.length > 0) {
      result.comments = await this._commentsMapping(comments);
    }

    return result;
  }

  // async _commentsMapping(comments) {
  //   return comments.map((comment) => ({
  //     id: comment.id,
  //     content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
  //     date: comment.date,
  //     username: comment.username,
  //   }));
  // }

  async _commentsMapping(comments) {
    const commentPromises = comments.map(async (comment) => ({
      id: comment.id,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      date: comment.date,
      username: comment.username,
      replies: await this._repliesRepository.findRepliesByCommentId(comment.id),
    }));

    return Promise.all(commentPromises);
  }
}

module.exports = GetDetailThreadUseCase;
