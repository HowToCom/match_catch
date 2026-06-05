import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { matchApi } from '../api';

// 내 userId — 실제 연동 시 localStorage나 Context에서 가져오세요
const MY_USER_ID = 1;

// 상태 뱃지 색상
const STATUS_BADGE = {
  PENDING:   { label: '수락 대기 중', cls: 'bg-primary/10 text-primary' },
  ACCEPTED:  { label: '매칭 진행 중', cls: 'bg-emerald-50 text-emerald-600' },
  DELIVERED: { label: '인도 완료',    cls: 'bg-gray-100 text-gray-400' },
  REJECTED:  { label: '거절됨',       cls: 'bg-red-50 text-red-400' },
};

function MatchManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received');

  // ✅ API에서 받아온 매칭 목록
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // 상세 펼치기 상태: match_id를 key로 관리
  const [openIds, setOpenIds] = useState({});

  // ✅ 매칭 목록 조회 — GET /matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const data = await matchApi.getMatches();
        setMatches(data);
      } catch (err) {
        alert('매칭 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // ✅ 수신함: 내가 receiver인 PENDING 매칭
  const receivedMatches = matches.filter(
    m => m.receiver?.user_id === MY_USER_ID && m.status === 'PENDING'
  );

  // ✅ 발신함: 내가 requester인 모든 매칭
  const sentMatches = matches.filter(
    m => m.requester?.user_id === MY_USER_ID
  );

  const toggleOpen = (id) =>
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));

  // ✅ 수락 — PATCH /matches/:match_id/accept
  const handleAccept = async (e, matchId) => {
    e.stopPropagation();
    if (!window.confirm('매칭 요청을 수락하시겠습니까? 채팅방이 생성됩니다.')) return;
    try {
      const result = await matchApi.acceptMatch(matchId);
      setMatches(prev =>
        prev.map(m =>
          m.match_id === matchId
            ? { ...m, status: 'ACCEPTED', chat_room_id: result.chat_room_id }
            : m
        )
      );
      alert('수락되었습니다! 채팅방이 생성되었습니다.');
    } catch (err) {
      alert('수락 처리에 실패했습니다.');
    }
  };

  // ✅ 거절 — PATCH /matches/:match_id/reject (백엔드 미구현, 추가 요청 필요)
  const handleReject = async (e, matchId) => {
    e.stopPropagation();
    if (!window.confirm('매칭 요청을 거절하시겠습니까?')) return;
    try {
      await matchApi.rejectMatch(matchId);
      setMatches(prev =>
        prev.map(m =>
          m.match_id === matchId ? { ...m, status: 'REJECTED' } : m
        )
      );
      alert('거절되었습니다.');
    } catch (err) {
      alert('거절 처리에 실패했습니다.');
    }
  };

  const renderEmpty = (msg) => (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      </div>
      <p className="text-sm font-bold text-gray-400">{msg}</p>
    </div>
  );

  return (
    <Layout hideNav>
      {/* 상단 헤더 */}
      <div className="flex items-center px-4 py-6 border-b border-gray-100 bg-white">
        <button onClick={() => navigate(-1)} className="p-1 mr-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">매칭 요청 관리</h1>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex border-b border-gray-100 bg-white">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'received' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}
        >
          받은 요청
          {receivedMatches.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-primary text-white text-[10px] rounded-full">
              {receivedMatches.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'sent' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}
        >
          보낸 요청
        </button>
      </div>

      {/* 요청 리스트 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white pb-24">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
          </div>
        ) : activeTab === 'received' ? (
          /* ── 받은 요청 탭 ── */
          receivedMatches.length === 0
            ? renderEmpty('받은 요청이 없습니다')
            : receivedMatches.map(match => (
              <div
                key={match.match_id}
                className="p-4 border border-gray-200 rounded-2xl space-y-3 shadow-sm bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOpen(match.match_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 습득물 이미지 */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {match.found_item?.image_url
                        ? <img src={match.found_item.image_url} alt="습득물" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-200" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 leading-snug">
                        {match.lost_item?.title || '분실물 정보 없음'}
                      </h4>
                      <p
                        className="text-[10px] text-gray-400 mt-0.5 hover:text-gray-700 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/profile', { state: { userId: match.requester?.username, isOwnProfile: false } });
                        }}
                      >
                        분실자: <span className="font-semibold text-gray-600">{match.requester?.username}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">{openIds[match.match_id] ? '▲' : '▼'}</span>
                </div>

                {/* 상세 내용 펼침 */}
                {openIds[match.match_id] && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 mb-1">분실물 상세 내용</p>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {match.lost_item?.description || '상세 내용 없음'}
                    </p>
                  </div>
                )}

                {/* 수락 / 거절 버튼 */}
                <div className="flex gap-2 pt-1">
                  <button
                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                    onClick={(e) => handleReject(e, match.match_id)}
                  >
                    거절
                  </button>
                  <button
                    className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:brightness-95 transition-colors shadow-sm"
                    onClick={(e) => handleAccept(e, match.match_id)}
                  >
                    수락
                  </button>
                </div>
              </div>
            ))
        ) : (
          /* ── 보낸 요청 탭 ── */
          sentMatches.length === 0
            ? renderEmpty('보낸 요청이 없습니다')
            : sentMatches.map(match => {
              const badge = STATUS_BADGE[match.status] || STATUS_BADGE.PENDING;
              return (
                <div
                  key={match.match_id}
                  className="p-4 border border-gray-200 rounded-2xl flex items-center justify-between shadow-sm bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {match.found_item?.image_url
                        ? <img src={match.found_item.image_url} alt="습득물" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-200" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {match.found_item?.description
                          ? match.found_item.description.substring(0, 20) + '...'
                          : '습득물 정보 없음'}
                      </h4>
                      <p
                        className="text-[10px] text-gray-400 mt-0.5 hover:text-gray-700 hover:underline cursor-pointer"
                        onClick={() => navigate('/profile', { state: { userId: match.receiver?.username, isOwnProfile: false } })}
                      >
                        습득자: <span className="font-semibold text-gray-600">{match.receiver?.username}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] px-3 py-1.5 font-bold rounded-full flex-shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })
        )}
      </div>
    </Layout>
  );
}

export default MatchManagementPage;
