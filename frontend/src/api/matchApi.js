import { BASE_URL } from './index';
import { tokenStorage } from './authApi';

const authHeader = () => ({
  Authorization: `Bearer ${tokenStorage.get()}`,
  'Content-Type': 'application/json',
});

export const matchApi = {
  createMatch: async (lostItemId, foundItemId) => {
    const res = await fetch(`${BASE_URL}/matches`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ lost_item_id: lostItemId, found_item_id: foundItemId }),
    });
    if (!res.ok) throw new Error('매칭 요청 실패');
    const json = await res.json();
    return json.data;
  },

  getMatches: async () => {
    const res = await fetch(`${BASE_URL}/matches`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('매칭 목록 조회 실패');
    const json = await res.json();
    return json.data;
  },

  getMatchDetail: async (matchId) => {
    const res = await fetch(`${BASE_URL}/matches/${matchId}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('매칭 상세 조회 실패');
    const json = await res.json();
    return json.data;
  },

  acceptMatch: async (matchId) => {
    const res = await fetch(`${BASE_URL}/matches/${matchId}/accept`, {
      method: 'PATCH',
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('매칭 수락 실패');
    const json = await res.json();
    return json.data;
  },

  rejectMatch: async (matchId) => {
    const res = await fetch(`${BASE_URL}/matches/${matchId}/reject`, {
      method: 'PATCH',
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('매칭 거절 실패');
    const json = await res.json();
    return json.data;
  },

  deliverMatch: async (matchId) => {
    const res = await fetch(`${BASE_URL}/matches/${matchId}/deliver`, {
      method: 'PATCH',
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('인도 완료 처리 실패');
    const json = await res.json();
    return json.data;
  },

  writeReview: async (reviewData) => {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({
        match_id: reviewData.match_id,
        target_user_id: reviewData.target_user_id,
        review_type: reviewData.review_type,
        content: reviewData.content,
      }),
    });
    if (!res.ok) throw new Error('후기 작성 실패');
    const json = await res.json();
    return json.data;
  },
};
