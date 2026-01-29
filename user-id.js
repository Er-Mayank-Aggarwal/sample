// user-id.js
const userId = {
  get() {
    return localStorage.getItem('user_id');
  },
  set(id) {
    if (id) {
      localStorage.setItem('user_id', String(id));
    }
  },
  clear() {
    localStorage.removeItem('user_id');
  },

  // ✅ NEW
  wait() {
    return new Promise((resolve, reject) => {
      const existing = localStorage.getItem('user_id');
      if (existing) {
        resolve(existing);
        return;
      }

      let tries = 0;
      const interval = setInterval(() => {
        const id = localStorage.getItem('user_id');
        if (id) {
          clearInterval(interval);
          resolve(id);
        }
        tries++;
        if (tries > 50) { // ~5 seconds
          clearInterval(interval);
          reject(new Error("Backend user_id not found"));
        }
      }, 100);
    });
  }
};

export default userId;
