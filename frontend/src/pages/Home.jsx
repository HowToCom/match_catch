import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const HomePage = () => {
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);

  const handleFoundClick = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    navigate('/upload', { state: { mode: 'found', capturedFile: file } });
    e.target.value = '';
  };

  const handleLostClick = () => {
    navigate('/upload', { state: { mode: 'lost' } });
  };

  return (
    <Layout>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />

      <div className="flex-1 flex flex-col min-h-0 bg-white relative overflow-hidden">

        {/* 배경 장식 — 왼쪽 중상단, 작게 */}
        <div
          className="absolute -top-16 -left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(123,143,224,0.13) 0%, rgba(70,75,170,0.04) 58%, transparent 75%)' }}
        />

        {/* 상단 헤더 */}
        <div className="relative px-6 pt-14 pb-10">
          <p className="text-xs font-semibold tracking-widest text-primary-light uppercase mb-2">
            분실물 매칭 서비스
          </p>
          <h1 className="text-[2rem] font-black leading-tight text-gray-900">
            Match<br />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Catch!!
            </span>
          </h1>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            잃어버린 물건을 빠르게 찾아드려요.<br />
            사진 한 장으로 AI가 자동 분석합니다.
          </p>
        </div>

        {/* 카드 영역 */}
        <div className="flex-1 flex flex-col justify-center px-6 gap-4 pb-32">

          {/* 습득물 등록 카드 */}
          <button
            onClick={handleFoundClick}
            className="group relative w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
            style={{ boxShadow: '0 4px 24px rgba(70,75,170,0.18)' }}
          >
            <div className="bg-gradient-to-br from-primary to-primary-light p-6 relative overflow-hidden">
              {/* 카드 내부 원 — 크고 하나만 */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white opacity-[0.07] pointer-events-none" />

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <p className="text-white/70 text-xs font-semibold tracking-wider uppercase mb-1">Found Item</p>
                <h2 className="text-white text-xl font-black mb-1">습득물 등록</h2>
                <p className="text-white/70 text-xs leading-relaxed">
                  카메라가 바로 열립니다<br />사진 촬영 후 AI가 자동으로 분석해요
                </p>
              </div>
            </div>
          </button>

          {/* 분실물 검색 카드 */}
          <button
            onClick={handleLostClick}
            className="group relative w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98] border border-gray-100"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
          >
            <div className="bg-white p-6 relative overflow-hidden">
              {/* 카드 내부 원 — 크고 하나만 */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-primary opacity-[0.04] pointer-events-none" />

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#464BAA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <p className="text-primary-light text-xs font-semibold tracking-wider uppercase mb-1">Lost Item</p>
                <h2 className="text-gray-900 text-xl font-black mb-1">분실물 검색</h2>
                <p className="text-gray-400 text-xs leading-relaxed">
                  잃어버린 물건을 설명하면<br />AI가 유사한 습득물을 찾아줍니다
                </p>
              </div>
            </div>
          </button>

        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
