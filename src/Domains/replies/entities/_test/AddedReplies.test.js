const AddedReplies = require('../AddedReplies');

describe('a AddedReplies', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      tittle: 'test tittle',
    };

    expect(() => new AddedReplies(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'test reply',
      owner: 'user-123',
    };

    expect(() => new AddedReplies(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply entities correctly', () => {
    const payload = {
      id: 'replies-123',
      content: 'test reply',
      owner: 'user-123',
    };

    const addReplies = new AddedReplies(payload);

    expect(addReplies).toBeInstanceOf(AddedReplies);
    expect(addReplies.id).toEqual(payload.id);
    expect(addReplies.content).toEqual(payload.content);
    expect(addReplies.owner).toEqual(payload.owner);
  });
});
