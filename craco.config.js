module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          url: false,
          util: false,
          stream: false,
          buffer: false,
          process: false
        }
      }
    }
  }
};