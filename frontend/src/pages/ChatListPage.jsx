import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function ChatListPage() {
  const navigate = useNavigate();

  const chatRooms = [
    { 
      id: 1, 
      userId: "user", 
      lastMsg: "인도가 완료되었어요. 후기를 작성해 주세요", 
      time: "오후 2:30", 
      img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      isSystem: true,
      unread: 1
    },
    { 
      id: 2, 
      userId: "cnuchacha", 
      lastMsg: "물건 확인했습니다! 감사합니다.", 
      time: "어제", 
      img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      isSystem: false,
      unread: 0
    },
  ];

  return (
    <Layout>
      <div
        className="absolute top-20 -right-40 w-[340px] h-[340px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(123,143,224,0.10) 0%, rgba(70,75,170,0.03) 55%, transparent 70%)' }}
      />
      <div className="px-6 pt-8 pb-4 bg-white">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-black text-gray-900">채팅</h1>
          <button 
            onClick={() => navigate('/matchmanagement')}
            className="flex items-center gap-1.5 bg-primary/8 text-primary px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-primary/15 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
            요청 관리
          </button>
        </div>
        <p className="text-xs text-gray-400 font-medium">{chatRooms.length}개의 대화</p>
      </div>

      <div className="h-px bg-gray-50 mx-6" />

      <div className="flex-1 overflow-y-auto pb-24 bg-white">
        {chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pb-16 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.8">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-400">아직 채팅이 없어요</p>
            <p className="text-xs text-gray-300">매칭이 수락되면 채팅이 시작됩니다</p>
          </div>
        ) : (
          <div className="pt-2">
            {chatRooms.map((room, index) => (
              <div 
                key={room.id}
                onClick={() => navigate('/chatdetail', {
                  state: {
                    chatId: room.id,
                    opponentName: room.userId,
                    postTitle: room.postTitle || "토끼 인형 키링",
                    postImg: "/images/chatmain.jpeg"
                  }
                })}
                className="relative flex items-center px-6 py-4 hover:bg-gray-50/80 cursor-pointer transition-colors active:bg-gray-100"
              >
                <div className="relative mr-4 flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                    <img src={room.img} alt="프로필" className="w-full h-full object-cover" />
                  </div>
                  {room.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{room.unread}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-sm ${room.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {room.userId}
                    </span>
                    <span className="text-[11px] text-gray-300 font-medium flex-shrink-0 ml-2">{room.time}</span>
                  </div>
                  <p className={`text-xs truncate leading-relaxed ${
                    room.isSystem 
                      ? 'text-primary font-semibold' 
                      : room.unread > 0 ? 'text-gray-600 font-semibold' : 'text-gray-400 font-medium'
                  }`}>
                    {room.isSystem && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 mb-px align-middle" />
                    )}
                    {room.lastMsg}
                  </p>
                </div>

                <svg className="w-4 h-4 text-gray-200 ml-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ChatListPage;
