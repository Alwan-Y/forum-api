const AddReplies = require('../AddReplies');

describe('AddReplies entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      tittle: 'test tittle',
    };

    expect(() => new AddReplies(payload)).toThrowError('ADD_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      content: 123,
    };

    expect(() => new AddReplies(payload)).toThrowError('ADD_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReplies entities correctly', () => {
    const payload = {
      content: 'test reply',
    };

    const addReplies = new AddReplies(payload);

    expect(addReplies).toBeInstanceOf(AddReplies);
    expect(addReplies.content).toEqual(payload.content);
  });
});
