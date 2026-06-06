import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ACTIVE_COLOR = '#464BAA';
const INACTIVE_COLOR = '#9CA3AF';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isProfileActive = location.pathname === '/profile' && location.state?.isOwnProfile !== false;

  return (
    <div className="absolute bottom-0 left-0 w-full h-[72px] bg-white border-t border-gray-100 flex justify-around items-center z-50">

      <button
        onClick={() => navigate('/home')}
        className="flex flex-col items-center justify-center w-16 h-full transition-all active:scale-95"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={isActive('/home') ? ACTIVE_COLOR : INACTIVE_COLOR}
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          {isActive('/home') && <polyline points="9 22 9 12 15 12 15 22" stroke={ACTIVE_COLOR} strokeWidth="2.2"/>}
        </svg>
        <span className={`text-[10px] mt-1 font-bold ${isActive('/home') ? 'text-primary' : 'text-gray-400'}`}>
          홈
        </span>
        {isActive('/home') && (
          <div className="absolute bottom-2 w-1 h-1 rounded-full bg-primary" />
        )}
      </button>

      <button
        onClick={() => navigate('/chatlist')}
        className="flex flex-col items-center justify-center w-16 h-full transition-all active:scale-95"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={isActive('/chatlist') ? ACTIVE_COLOR : INACTIVE_COLOR}
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span className={`text-[10px] mt-1 font-bold ${isActive('/chatlist') ? 'text-primary' : 'text-gray-400'}`}>
          채팅
        </span>
        {isActive('/chatlist') && (
          <div className="absolute bottom-2 w-1 h-1 rounded-full bg-primary" />
        )}
      </button>

      <button
        onClick={() => navigate('/profile', {
          state: { isOwnProfile: true, userId: '차차', userImg: '/images/profile.png' }
        })}
        className="flex flex-col items-center justify-center w-16 h-full transition-all active:scale-95"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={isProfileActive ? ACTIVE_COLOR : INACTIVE_COLOR}
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span className={`text-[10px] mt-1 font-bold ${isProfileActive ? 'text-primary' : 'text-gray-400'}`}>
          프로필
        </span>
        {isProfileActive && (
          <div className="absolute bottom-2 w-1 h-1 rounded-full bg-primary" />
        )}
      </button>

    </div>
  );
};

export default BottomNav;
