import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { chatApi, matchApi } from '../api'; 

function ChatDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const chatRoomInfo = {
    chatRoomId: location.state?.chatRoomId || 1,
    matchId: location.state?.matchId || 1,
    partnerName: location.state?.opponentName || "상대방",
    partnerId: location.state?.opponentId || "default_target_id",
    itemTitle: location.state?.postTitle || "물품 정보 없음",
    itemImg: location.state?.postImg || "https://via.placeholder.com/50",
  };

  const [itemStatus, setItemStatus] = useState("MATCHING");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setIsLoading(true);
        const response = await chatApi.getMessages(chatRoomInfo.chatRoomId);
        const formattedMessages = response.messages.map(msg => ({
          id: msg.message_id,
          sender: msg.sender_id === 1 ? "me" : chatRoomInfo.partnerName, 
          text: msg.message,
          type: "TALK"
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("메시지를 불러오지 못했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChatData();
  }, [chatRoomInfo.chatRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const currentText = inputText;
    setInputText("");
    try {
      const response = await chatApi.sendMessage(chatRoomInfo.chatRoomId, currentText);
      setMessages(prev => [...prev, {
        id: response.message_id,
        sender: "me",
        text: response.message,
        type: "TALK"
      }]);
    } catch (error) {
      alert("메시지 전송에 실패했습니다.");
      setInputText(currentText); 
    }
  };

  const handleCompleteDelivery = async () => {
    const confirm = window.confirm("물건을 성공적으로 전달받으셨나요? 상대방도 수락해야 '인도 완료' 처리됩니다.");
    if (confirm) {
      try {
        await matchApi.deliverMatch(chatRoomInfo.matchId);
        setItemStatus("DELIVERED");
        setMessages(prev => [...prev, {
          id: `system_${Date.now()}`,
          sender: "SYSTEM",
          text: "물품 인도가 완료되었습니다! 따뜻한 거래를 위해 서로에게 후기를 남겨주세요.",
          type: "SYSTEM"
        }]);
        alert("인도 완료 처리가 완료되었습니다.");
      } catch (error) {
        alert("상태 변경 처리에 실패했습니다.");
      }
    }
  };

  return (
    <Layout hideNav>
      <div className="flex items-center px-4 py-3.5 border-b border-gray-100 bg-white">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-1 rounded-xl hover:bg-gray-100 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center mr-2.5 flex-shrink-0">
          <span className="text-xs font-black text-primary">{chatRoomInfo.partnerName[0]}</span>
        </div>
        <div>
          <span className="font-bold text-gray-900 text-sm">{chatRoomInfo.partnerName}</span>
          <p className="text-[10px] text-gray-400 font-medium">활성</p>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
        <div className="bg-white rounded-2xl px-3 py-2.5 flex items-center shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden mr-3 flex-shrink-0">
            <img src={chatRoomInfo.itemImg} alt="물품" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-gray-800 truncate">{chatRoomInfo.itemTitle}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                itemStatus === 'DELIVERED' ? 'bg-gray-300' : 'bg-primary'
              }`} />
              <p className={`text-[10px] font-bold ${
                itemStatus === 'DELIVERED' ? 'text-gray-400' : 'text-primary'
              }`}>
                {itemStatus === 'DELIVERED' ? '인도 완료' : '매칭 진행중'}
              </p>
            </div>
          </div>
          
          {itemStatus === "MATCHING" ? (
            <button 
              onClick={handleCompleteDelivery}
              className="flex-shrink-0 bg-primary text-white px-3.5 py-2 rounded-xl text-[11px] font-bold shadow-sm active:scale-95 transition-transform"
            >
              인도 완료
            </button>
          ) : (
            <span className="flex-shrink-0 bg-emerald-50 text-emerald-600 px-3.5 py-2 rounded-xl text-[11px] font-bold">
              완료됨
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-white pb-24">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-300 font-bold px-1">2026년 5월 18일</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {messages.map((msg) => {
              if (msg.type === "SYSTEM") {
                return (
                  <div key={msg.id} className="flex flex-col items-center my-4">
                    <div className="bg-gradient-to-br from-primary/5 to-primary-light/5 border border-primary/10 rounded-2xl p-4 text-center max-w-[88%] space-y-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#464BAA" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">{msg.text}</p>
                      <button 
                        onClick={() => navigate('/review', {
                          state: {
                            matchId: chatRoomInfo.matchId,
                            opponentName: chatRoomInfo.partnerName,
                            postTitle: chatRoomInfo.itemTitle,
                            targetUserId: chatRoomInfo.partnerId
                          }
                        })}
                        className="w-full bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold py-2.5 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
                      >
                        후기 작성하러 가기 →
                      </button>
                    </div>
                  </div>
                );
              }

              const isMe = msg.sender === "me";
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 mb-0.5">
                      <span className="text-[10px] font-black text-gray-500">{chatRoomInfo.partnerName[0]}</span>
                    </div>
                  )}
                  <div className={`max-w-[72%] px-4 py-2.5 text-sm font-medium shadow-sm break-words leading-relaxed ${
                    isMe 
                      ? 'bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl rounded-br-md' 
                      : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form 
        onSubmit={handleSendMessage}
        className="p-4 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0"
      >
        <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-2.5 border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
          <input 
            type="text" 
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-300"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()} 
            className={`ml-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              inputText.trim() 
                ? 'bg-primary text-white shadow-sm hover:brightness-105 active:scale-90' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default ChatDetailPage;
