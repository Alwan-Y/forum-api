const AddRepliesUseCase = require('../../../../Applications/use_case/AddRepliesUseCase');
const DeleteRepliesUseCase = require('../../../../Applications/use_case/DeleteRepliesUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postRepliesHandler = this.postRepliesHandler.bind(this);
    this.deleteRepliesHandler = this.deleteRepliesHandler.bind(this);
  }

  async postRepliesHandler(request, h) {
    const addRepliesUseCase = this._container.getInstance(AddRepliesUseCase.name);
    const replyPayload = {
      ...request.payload,
      commentId: request.params.commentId,
      threadId: request.params.threadId,
      owner: request.auth.credentials.id,
    };

    const addedReply = await addRepliesUseCase.execute(replyPayload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteRepliesHandler(request) {
    const deleteRepliesUseCase = this._container.getInstance(DeleteRepliesUseCase.name);
    const replyPayload = {
      replyId: request.params.replyId,
      owner: request.auth.credentials.id,
    };
    await deleteRepliesUseCase.execute(replyPayload);

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
