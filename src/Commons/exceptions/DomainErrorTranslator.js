const InvariantError = require('./InvariantError');
const NotFoundError = require('./NotFoundError');
const AuthorizationError = require('./AuthorizationError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan judul dan isi thread'),
  'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('judul dan isi thread harus string'),
  'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan judul, isi thread, tanggal, dan user id'),
  'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('id, judul, isi thread, tanggal, dan user id harus string'),
  'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan content'),
  'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('isi comment harus string'),
  'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan id, content, tanggal, dan user id'),
  'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('id, content, tanggal, dan user id harus string'),
  'ADD_COMMENT_USE_CASE.NOT_CONTAIN_THREAD_ID': new InvariantError('harus mengirimkan id thread'),
  'ADD_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('id thread harus string'),
  'ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND': new NotFoundError('thread tidak ditemukan'),
  'DELETE_COMMENT_USE_CASE.COMMENT_NOT_OWNER': new AuthorizationError('anda tidak memiliki akses untuk menghapus comment ini'),
  'DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND': new NotFoundError('comment tidak ditemukan'),
  'DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID': new InvariantError('harus mengirimkan id comment'),
  'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('id comment harus string'),
  'GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID': new InvariantError('harus mengirimkan id thread'),
  'GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('id thread harus string'),
  'GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND': new NotFoundError('thread tidak ditemukan'),
  'ADD_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan content'),
  'ADD_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('isi REPLIES harus string'),
  'ADDED_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan id, content, tanggal, dan user id'),
  'ADDED_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('id, content, tanggal, dan user id harus string'),
  'ADD_REPLIES_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan content'),
  'ADD_REPLIES_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('content harus string'),
  'ADD_REPLIES_USE_CASE.THREAD_NOT_FOUND': new NotFoundError('thread tidak ditemukan'),
  'ADD_REPLIES_USE_CASE.COMMENT_NOT_FOUND': new NotFoundError('comment tidak ditemukan'),
  'DELETE_REPLIES_USE_CASE.REPLIES_NOT_OWNER': new AuthorizationError('anda tidak memiliki akses untuk menghapus REPLIES ini'),
  'DELETE_REPLIES_USE_CASE.REPLIES_NOT_FOUND': new NotFoundError('REPLIES tidak ditemukan'),
  'DELETE_REPLIES_USE_CASE.NOT_CONTAIN_REPLIES_ID': new InvariantError('harus mengirimkan id REPLIES'),
  'DELETE_REPLIES_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('id REPLIES harus string'),
};

module.exports = DomainErrorTranslator;
