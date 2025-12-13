export default {
  get: async (_url, _config) => ({ data: {} }),
  post: async (_url, _data, _config) => ({ data: {} }),
  create: () => ({
    get: async (_url, _config) => ({ data: {} }),
    post: async (_url, _data, _config) => ({ data: {} }),
  }),
};
