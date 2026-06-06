import { BASE_URL } from './index';
import { tokenStorage } from './authApi';

const authHeader = () => ({
  Authorization: `Bearer ${tokenStorage.get()}`,
  'Content-Type': 'application/json',
});

export const chatApi = {
  sendMessage: async (chatRoomId, messageText) => {
    const res = await fetch(`${BASE_URL}/chat-rooms/${chatRoomId}/messages`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ message: messageText }),
    });
    if (!res.ok) throw new Error('메시지 전송 실패');
    const json = await res.json();
    return json.data;
  },

  getMessages: async (chatRoomId, cursor = null, size = 20) => {
    const params = new URLSearchParams({ size });
    if (cursor) params.append('cursor', cursor);

    const res = await fetch(`${BASE_URL}/chat-rooms/${chatRoomId}/messages?${params}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('메시지 조회 실패');
    const json = await res.json();
    return json.data;
  },
};
