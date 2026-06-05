import { delay } from './index';

export const profileApi = {
  // 내 프로필 조회
  // ✅ 백엔드: GET /profile/me
  getProfile: async () => {
    await delay(500);
    return {
      user_id: 1,
      student_id: '20261234',
      username: '차차',
      temperature: 36.5,
    };
  },

  // 내 활동 내역 조회
  // ✅ 백엔드: GET /profile/me/activities
  getActivities: async () => {
    await delay(600);
    return [
      {
        activity_id: 101,
        activity_type: 'DELIVERY_COMPLETED',
        description: '에어팟 프로 인도 완료',
        created_at: '2026-05-18T14:20:00Z',
      },
      {
        activity_id: 102,
        activity_type: 'DELIVERY_COMPLETED',
        description: '삼색 고양이 인형 매칭 수락',
        created_at: '2026-05-19T10:00:00Z',
      },
    ];
  },
};
