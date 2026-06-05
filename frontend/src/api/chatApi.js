import { delay } from './index';

export const chatApi = {
  // 메시지 전송
  sendMessage: async (chatRoomId, messageText) => {
    await delay(200);

    return {
      message_id: Date.now(),
      sender_id: 1, // 내 ID (가정)
      message: messageText,
      created_at: new Date().toISOString()
    };
  },

  // 메시지 목록 조회
  getMessages: async (chatRoomId, cursor = null, size = 20) => {
    await delay(500);
    
    return {
      messages: [
        { 
          message_id: 1, 
          sender_id: 2, // 상대방 ID
          message: "안녕하세요! 물건 주우신 분 맞으신가요?", 
          created_at: "2026-05-19T10:00:00Z" 
        },
        { 
          message_id: 2, 
          sender_id: 1, // 내 ID
          message: "네 맞습니다! 정문 앞에서 만나는 거 어떠세요?", 
          created_at: "2026-05-19T10:02:00Z" 
        },
        { 
          message_id: 3, 
          sender_id: 2, 
          message: "좋습니다! 지금 바로 갈게요", 
          created_at: "2026-05-19T10:02:00Z" 
        },
        { 
          message_id: 4, 
          sender_id: 1, // 내 ID
          message: "넵 알겠습니다", 
          created_at: "2026-05-19T10:02:00Z" 
        },
        { 
          message_id: 5, 
          sender_id: 2, 
          message: "덕분에 잃어버린 물건을 무사히 찾았습니다~ 정말 감사드려요!", 
          created_at: "2026-05-19T10:02:00Z" 
        }
      ],
      next_cursor: 2, // 다음 페이지 조회를 위한 커서
      has_next: false // 더 불러올 메시지가 있는지 여부
    };
  }
};