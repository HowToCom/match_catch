import React from 'react';
import BottomNav from './BottomNav';

const Layout = ({ children, hideNav = false, modal = null }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 sm:py-8">
      <div className="w-full h-screen sm:w-[412px] sm:h-[917px] bg-white flex flex-col relative overflow-hidden font-['Inter'] sm:rounded-2xl sm:shadow-xl">

        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>

        {!hideNav && <BottomNav />}

        {modal}

      </div>
    </div>
  );
};

export default Layout;
