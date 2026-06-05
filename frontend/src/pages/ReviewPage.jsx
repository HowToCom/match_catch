import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { matchApi } from '../api'; 

function ReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const matchId = location.state?.matchId || "default_id";
  const opponentName = location.state?.opponentName || "상대방";
  const postTitle = location.state?.postTitle || "물품 정보 없음";
  const targetUserId = location.state?.targetUserId || "default_target_id";

  const [satisfaction, setSatisfaction] = useState(null); 
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!satisfaction) {
      alert("만족 또는 불만족 중 하나를 반드시 선택해주세요!");
      return;
    }
    try {
      setIsLoading(true);
      await matchApi.writeReview({
        match_id: matchId,
        target_user_id: targetUserId, 
        review_type: satisfaction, 
        content: comment
      });
      alert(`후기가 성공적으로 등록되었습니다. ${opponentName}님의 온도가 ${satisfaction === 'POSITIVE' ? '+5' : '-5'}도 반영됩니다.`);
      navigate('/home'); 
    } catch (error) {
      alert("후기 등록 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideNav>
      <div className="flex-1 flex flex-col bg-white h-full overflow-y-auto">

        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center bg-white">
          <button 
            onClick={() => navigate(-1)} 
            disabled={isLoading} 
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="font-black text-base text-gray-900 ml-2">거래 후기</span>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto pb-10">

          {/* 물품 카드 */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm">
              <img src="/images/chatmain.jpeg" alt="물품" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">거래 물품</p>
              <h4 className="font-bold text-sm text-gray-800 leading-snug">{postTitle}</h4>
            </div>
          </div>

          {/* 만족도 */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">거래 만족도</p>
              <h2 className="text-lg font-black text-gray-900 leading-snug">
                <span className="text-primary">{opponentName}</span>님과의<br/>거래는 어떠셨나요?
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* 만족 */}
              <button 
                onClick={() => setSatisfaction('POSITIVE')}
                disabled={isLoading}
                className={`relative py-5 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-2 border-2 overflow-hidden ${
                  satisfaction === 'POSITIVE' 
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                    : 'border-gray-100 bg-gray-50 hover:border-primary/30 hover:bg-primary/3'
                } disabled:opacity-50`}
              >
                {satisfaction === 'POSITIVE' && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
                <span className="text-2xl">😊</span>
                <span className={`text-xs font-black ${satisfaction === 'POSITIVE' ? 'text-primary' : 'text-gray-500'}`}>
                  만족해요
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  satisfaction === 'POSITIVE' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  +5도 🌡️
                </span>
              </button>

              {/* 불만족 */}
              <button 
                onClick={() => setSatisfaction('NEGATIVE')}
                disabled={isLoading}
                className={`relative py-5 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-2 border-2 overflow-hidden ${
                  satisfaction === 'NEGATIVE' 
                    ? 'border-gray-500 bg-gray-50 shadow-md shadow-gray-200' 
                    : 'border-gray-100 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                } disabled:opacity-50`}
              >
                {satisfaction === 'NEGATIVE' && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
                <span className="text-2xl">😕</span>
                <span className={`text-xs font-black ${satisfaction === 'NEGATIVE' ? 'text-gray-700' : 'text-gray-500'}`}>
                  아쉬워요
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  satisfaction === 'NEGATIVE' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  -5도 🌡️
                </span>
              </button>
            </div>
          </div>

          {/* 후기 텍스트 */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400">
              상세 후기 <span className="text-gray-300 font-medium">(선택)</span>
            </p>
            <div className={`rounded-2xl border-2 transition-all ${isFocused ? 'border-primary/30 bg-white shadow-sm shadow-primary/5' : 'border-gray-100 bg-gray-50'}`}>
              <textarea 
                value={comment}
                disabled={isLoading}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="따뜻한 후기를 남겨주시면 상대방의 온도가 올라갑니다 ☀️"
                className="w-full h-28 p-4 bg-transparent text-sm outline-none resize-none font-medium text-gray-700 placeholder:text-gray-300 disabled:opacity-50"
              />
              <div className="px-4 pb-3 flex justify-end">
                <span className={`text-[10px] font-bold ${comment.length > 0 ? 'text-primary' : 'text-gray-300'}`}>
                  {comment.length}자
                </span>
              </div>
            </div>
          </div>

          {/* 등록 버튼 */}
          <button 
            onClick={handleSubmit}
            disabled={!satisfaction || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
              satisfaction && !isLoading
                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/25 active:scale-[0.98]' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                </svg>
                등록 중...
              </span>
            ) : '후기 등록하기'}
          </button>

          {!satisfaction && (
            <p className="text-center text-[11px] text-gray-300 font-medium -mt-3">만족도를 먼저 선택해주세요</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ReviewPage;
