let accessToken = null;
const listeners = new Set();

export const getAccessToken = () => accessToken;

export const setAccessToken = (token) => {
  accessToken = token || null;
  listeners.forEach((fn) => fn(accessToken));
};

export const clearAccessToken = () => setAccessToken(null);

export const subscribeAccessToken = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
