import { BASE_URL } from './index';

export const tokenStorage = {
  save: (token) => localStorage.setItem('access_token', token),
  get: () => localStorage.getItem('access_token'),
  remove: () => localStorage.removeItem('access_token'),
};

export const authApi = {
  login: async (userId, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: userId, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || '아이디 또는 비밀번호가 틀렸습니다.');
    }
    const json = await res.json();
    tokenStorage.save(json.data.access_token);
    return json.data;
  },

  register: async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: userData.student_id,
        username: userData.username,
        password: userData.password,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || '회원가입 중 오류가 발생했습니다.');
    }
    const json = await res.json();
    return json.data;
  },

  logout: () => {
    tokenStorage.remove();
  },
};
