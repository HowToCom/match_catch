import { BASE_URL } from './index';
import { tokenStorage } from './authApi';

const authHeader = () => ({
  Authorization: `Bearer ${tokenStorage.get()}`,
});

export const profileApi = {
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile/me`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('프로필 조회 실패');
    const json = await res.json();
    return json.data;
  },

  getActivities: async () => {
    const res = await fetch(`${BASE_URL}/profile/me/activities`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('활동 내역 조회 실패');
    const json = await res.json();
    return json.data;
  },
};
