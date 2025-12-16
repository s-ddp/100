export default {
  schedule(_expr, fn) {
    const timer = setInterval(fn, 60 * 60 * 1000);
    return { stop: () => clearInterval(timer) };
  },
};
