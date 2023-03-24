class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    // const addThread = new AddedThread(useCasePayload);
    await this._threadRepository.checkThreadByTitle(useCasePayload.title);
    return this._threadRepository.addThread(useCasePayload);
  }
}

module.exports = AddThreadUseCase;
