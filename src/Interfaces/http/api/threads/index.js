const ThreadHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'threads',
  register: async (server, { container }) => {
    const threadsHandler = new ThreadHandler(container);
    server.route(routes(threadsHandler));
  },
};
