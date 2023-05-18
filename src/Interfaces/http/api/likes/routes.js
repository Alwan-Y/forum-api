const routes = (handler) => [
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.putLikesCommentHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
];

module.exports = routes;
