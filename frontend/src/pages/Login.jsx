import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { authApi, tokenStorage } from '../api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (userId.trim() === '' || password.trim() === '') {
      return alert('아이디와 비밀번호를 모두 입력해주세요!');
    }
    try {
      setIsLoading(true);
      const response = await authApi.login(userId, password);
      // ✅ 토큰 저장 후 이동
      if (response.access_token) {
        tokenStorage.save(response.access_token);
      }
      navigate('/home');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideNav>
      <div className="flex-1 flex flex-col bg-white h-full overflow-hidden relative">

        {/* 배경 장식 — 오른쪽 상단, 크게 */}
        <div
          className="absolute -top-32 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(123,143,224,0.15) 0%, rgba(70,75,170,0.05) 55%, transparent 72%)' }}
        />

        {/* 로고 영역 */}
        <div className="relative z-10 flex flex-col items-center pt-20 pb-10 px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-5 shadow-lg shadow-primary/25">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Match Catch
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide">분실물 매칭 서비스</p>
        </div>

        {/* 폼 */}
        <div className="flex-1 flex flex-col px-6 overflow-y-auto">
          <div className="space-y-4">

            {/* 아이디 */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 transition-colors ${focusedField === 'userId' ? 'text-primary' : 'text-gray-400'}`}>
                아이디
              </label>
              <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all border-2 ${
                focusedField === 'userId'
                  ? 'border-primary bg-white shadow-sm shadow-primary/10'
                  : 'border-transparent bg-gray-50'
              }`}>
                <svg className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${focusedField === 'userId' ? 'text-primary' : 'text-gray-300'}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-300"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onFocus={() => setFocusedField('userId')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="아이디를 입력하세요"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-gray-400'}`}>
                비밀번호
              </label>
              <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all border-2 ${
                focusedField === 'password'
                  ? 'border-primary bg-white shadow-sm shadow-primary/10'
                  : 'border-transparent bg-gray-50'
              }`}>
                <svg className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-gray-300'}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-300"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl text-sm font-bold transition-all ${
                isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-primary-light text-white active:scale-[0.98] shadow-lg shadow-primary/25'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                  </svg>
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300 font-medium">또는</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <Link
              to="/register"
              className="flex items-center justify-center w-full py-4 rounded-2xl border-2 border-gray-100 text-sm font-bold text-gray-500 hover:border-primary/30 hover:text-primary transition-all"
            >
              회원가입
            </Link>
          </div>

          <p className="text-center text-[11px] text-gray-300 mt-8 pb-8 font-medium">
            충남대학교 분실물 매칭 서비스
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
