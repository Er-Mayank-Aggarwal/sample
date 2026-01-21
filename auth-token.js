// auth-token.js
// Utility for managing AUTH_TOKEN in localStorage

const AuthToken = {
  get() {
    return localStorage.getItem('AUTH_TOKEN');
  },
  set(token) {
    if (token) {
      localStorage.setItem('AUTH_TOKEN', token);
    } else {
      localStorage.removeItem('AUTH_TOKEN');
    }
  },
  clear() {
    localStorage.removeItem('AUTH_TOKEN');
  }
};

export default AuthToken;
