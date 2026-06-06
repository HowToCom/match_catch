import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';

function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const myLostItemId = location.state?.lostItemId;
  const initialResults = location.state?.results || [];

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const sorted = [...initialResults].sort(
        (a, b) => (b.similarity_score || 0) - (a.similarity_score || 0)
      );
      setResults(sorted);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [initialResults]);

  const getScoreOpacity = (score) => {
    if (score >= 80) return 1;
    if (score >= 50) return 0.5;
    return 0.25;
  };

  return (
    <Layout>
      <div className="px-6 pt-8 pb-5 bg-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 bg-gradient-to-b from-primary to-primary-light rounded-full" />
          <h1 className="text-xl font-black text-gray-900">검색 결과</h1>
        </div>
        {!isLoading && results.length > 0 && (
          <p className="text-xs text-gray-400 font-medium pl-3">
            유사 습득물 <span className="text-primary font-bold">{results.length}건</span> 발견
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 bg-white">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6 pb-16">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center">
                <svg className="animate-spin w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                </svg>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-gray-700">AI가 분석 중이에요</p>
              <p className="text-xs text-gray-400 font-medium">유사한 습득물을 찾고 있습니다...</p>
            </div>
            {[1,2,3].map(i => (
              <div key={i} className="w-full h-28 bg-gray-100 rounded-2xl animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3 pt-1">
            {results.map((item, index) => {
              const score = item.similarity_score || 0;
              const opacity = getScoreOpacity(score);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform"
                >
                  <div className="flex p-4 gap-3.5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      <img src={item.img} alt="습득물" className="w-full h-full object-cover" />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          TOP
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${score}%`, opacity }}
                            />
                          </div>
                          <span
                            className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary text-white"
                            style={{ opacity }}
                          >
                            {score.toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
                          {item.content || '내용 없음'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(item.keywords || '').split(',').slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                              {kw.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/postdetail', {
                          state: { postId: item.id, mode: 'found', isAuthor: false, myLostItemId }
                        })}
                        className="self-end mt-2 bg-gray-900 text-white px-4 py-1.5 rounded-xl text-[11px] font-bold hover:bg-gray-700 transition-colors active:scale-95"
                      >
                        상세보기 →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 pb-16 space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-gray-800">일치하는 습득물이 없어요</p>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                분실하신 물건과 유사한 습득물이<br/>아직 등록되지 않았습니다
              </p>
            </div>
            <button
              onClick={() => navigate('/upload', { state: { mode: 'lost' } })}
              className="mt-2 px-6 py-3 bg-primary/8 text-primary rounded-2xl font-bold text-sm hover:bg-primary/15 transition-colors"
            >
              다른 키워드로 재검색
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SearchResultPage;
