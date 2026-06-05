import { delay } from './index';

// 토큰 저장/조회/삭제 헬퍼
export const tokenStorage = {
  save: (token) => localStorage.setItem('access_token', token),
  get: () => localStorage.getItem('access_token'),
  remove: () => localStorage.removeItem('access_token'),
};

export const authApi = {
  // 로그인
  login: async (userId, password) => {
    await delay(1000);

    const savedUsers = JSON.parse(localStorage.getItem('mockUsers')) || [];

    const matchedUser = savedUsers.find(
      user => user.userId === userId && user.password === password
    );

    if ((userId === 'chacha' && password === '1234') || matchedUser) {
      const token = 'fake-jwt-token-12345';
      // ✅ 토큰 저장
      tokenStorage.save(token);
      return {
        success: true,
        access_token: token,
        user_id: matchedUser ? matchedUser.id : 1,
        username: userId,
      };
    } else {
      throw new Error('아이디 또는 비밀번호가 틀렸습니다.');
    }
  },

  // 회원가입
  // ✅ 백엔드가 요구하는 키: student_id (기존: studentId)
  register: async (userData) => {
    await delay(1000);

    const savedUsers = JSON.parse(localStorage.getItem('mockUsers')) || [];

    const newUser = {
      id: Date.now(),
      studentId: userData.student_id,   // ← 내부 저장은 camelCase 유지
      userId: userData.username,
      password: userData.password,
    };

    savedUsers.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(savedUsers));

    return {
      success: true,
      user_id: newUser.id,
      student_id: userData.student_id,
      username: userData.username,
    };
  },

  // 로그아웃 (토큰 제거)
  logout: () => {
    tokenStorage.remove();
  },
};
