const GetThread = require('../GetThread');

describe('a GetThread', () => {
  it('should throw error when not contain detail thread property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'test thread',
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'test thread',
      body: 'test body',
      date: '2020-01-01',
      username: 'test user',
      comments: [],
    };

    // Action and Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetThread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'test thread',
      body: 'test body',
      date: '2020-01-01',
      username: 'test user',
      comments: [],
    };

    // Action
    const getThread = new GetThread(payload);

    // Assert
    expect(getThread).toBeInstanceOf(GetThread);
    expect(getThread.id).toEqual(payload.id);
    expect(getThread.title).toEqual(payload.title);
    expect(getThread.body).toEqual(payload.body);
    expect(getThread.date).toEqual(payload.date);
    expect(getThread.username).toEqual(payload.username);
    expect(getThread.comments).toEqual(payload.comments);
  });
});
