import { delay } from './index';

const getMockMatches = () => {
  const stored = JSON.parse(localStorage.getItem('mockMatches'));
  if (stored) return stored;

  // 처음 실행 시 기본 더미 데이터
  // ✅ 백엔드 응답 구조에 맞게 정리 (match_id → match_id, lost_item/found_item 중첩 객체)
  const initialMatches = [
    {
      match_id: 1,
      status: 'PENDING',
      lost_item: { lost_item_id: 'dummy_1', title: '검은색 카드 지갑', description: '검은색 가죽 카드 지갑입니다.', status: 'MATCH_REQUESTED' },
      found_item: { found_item_id: 'dummy_search_4', image_url: '/images/yellow.jpeg', description: '노란색 장우산입니다.', status: 'REGISTERED' },
      requester: { user_id: 1, username: '차차' },
      receiver:  { user_id: 2, username: 'Finder01' },
      chat_room_id: null,
      created_at: '2026-05-19T10:00:00Z',
    },
    {
      match_id: 2,
      status: 'ACCEPTED',
      lost_item: { lost_item_id: 'dummy_2', title: '흰색 텀블러', description: '스탠리 텀블러입니다.', status: 'MATCHING' },
      found_item: { found_item_id: 'dummy_search_2', image_url: '/images/white.jpeg', description: '흰색 단우산입니다.', status: 'MATCHING' },
      requester: { user_id: 3, username: 'User1234' },
      receiver:  { user_id: 1, username: '차차' },
      chat_room_id: 1,
      created_at: '2026-05-18T11:00:00Z',
    },
  ];
  localStorage.setItem('mockMatches', JSON.stringify(initialMatches));
  return initialMatches;
};

const saveMockMatches = (matches) =>
  localStorage.setItem('mockMatches', JSON.stringify(matches));

export const matchApi = {
  // 매칭 요청 (분실자 → 습득물)
  createMatch: async (lostItemId, foundItemId) => {
    await delay(800);
    const matches = getMockMatches();
    const newMatch = {
      match_id: Date.now(),
      status: 'PENDING',
      lost_item:  { lost_item_id: lostItemId,  title: '분실물', description: '', status: 'MATCH_REQUESTED' },
      found_item: { found_item_id: foundItemId, image_url: '', description: '',  status: 'REGISTERED' },
      requester: { user_id: 1, username: '차차' },
      receiver:  { user_id: 2, username: '상대방' },
      chat_room_id: null,
      created_at: new Date().toISOString(),
    };
    matches.push(newMatch);
    saveMockMatches(matches);
    return newMatch;
  },

  // 매칭 목록 조회
  // ✅ 백엔드: GET /matches → data 배열 반환
  getMatches: async () => {
    await delay(600);
    return getMockMatches();
  },

  // 매칭 상세 조회
  // ✅ 백엔드: GET /matches/:match_id
  getMatchDetail: async (matchId) => {
    await delay(300);
    const matches = getMockMatches();
    return (
      matches.find(m => m.match_id === matchId) || {
        match_id: matchId,
        status: 'ACCEPTED',
        created_at: new Date().toISOString(),
      }
    );
  },

  // 매칭 수락 (습득자)
  // ✅ 백엔드: PATCH /matches/:match_id/accept → chat_room_id 포함 응답
  acceptMatch: async (matchId) => {
    await delay(800);
    const matches = getMockMatches();
    const index = matches.findIndex(m => m.match_id === matchId);
    if (index > -1) {
      const chatRoomId = Date.now();
      matches[index].status = 'ACCEPTED';
      matches[index].chat_room_id = chatRoomId;
      if (matches[index].lost_item)  matches[index].lost_item.status  = 'MATCHING';
      if (matches[index].found_item) matches[index].found_item.status = 'MATCHING';
      saveMockMatches(matches);
      return {
        match_id: matchId,
        status: 'ACCEPTED',
        chat_room_id: chatRoomId,
      };
    }
    return { match_id: matchId, status: 'ACCEPTED', chat_room_id: null };
  },

  // 매칭 거절 (습득자)
  // ✅ 백엔드 라우트 누락 — 백엔드 팀에 PATCH /matches/:match_id/reject 추가 요청 필요
  rejectMatch: async (matchId) => {
    await delay(800);
    const matches = getMockMatches();
    const index = matches.findIndex(m => m.match_id === matchId);
    if (index > -1) {
      matches[index].status = 'REJECTED';
      saveMockMatches(matches);
    }
    return { match_id: matchId, status: 'REJECTED' };
  },

  // 인도 완료 처리
  // ✅ 백엔드: PATCH /matches/:match_id/deliver
  deliverMatch: async (matchId) => {
    await delay(1000);
    const matches = getMockMatches();
    const index = matches.findIndex(m => m.match_id === matchId);
    if (index > -1) {
      matches[index].status = 'DELIVERED';
      if (matches[index].lost_item)  matches[index].lost_item.status  = 'DELIVERED';
      if (matches[index].found_item) matches[index].found_item.status = 'DELIVERED';
      saveMockMatches(matches);
    }
    return { match_id: matchId, status: 'DELIVERED' };
  },

  // 후기 작성
  // ✅ 백엔드: POST /reviews (matchApi 아닌 reviewApi이지만 기존 구조 유지)
  writeReview: async (reviewData) => {
    await delay(800);
    const isPositive = reviewData.review_type === 'POSITIVE';
    return {
      review_id: Date.now(),
      match_id: reviewData.match_id,
      target_user_id: reviewData.target_user_id,
      review_type: reviewData.review_type,
      temperature_change: isPositive ? 5 : -5,
      target_user_temperature: isPositive ? 41.5 : 31.5,
    };
  },
};
