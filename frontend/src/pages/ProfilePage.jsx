import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { profileApi, matchApi } from '../api';

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const receivedIsOwnProfile = location.state?.isOwnProfile || false;
  const receivedUserId = location.state?.userId || '차차';

  const [isOwnProfile] = useState(receivedIsOwnProfile);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        if (isOwnProfile) {
          const [profile, activities, matches] = await Promise.all([
            profileApi.getProfile(),
            profileApi.getActivities(),
            matchApi.getMatches(),
          ]);

          const ongoingMatches = matches.filter(
            m => (m.status === 'PENDING' || m.status === 'ACCEPTED') && m.requester?.user_id === profile.user_id
          );
          const completedMatches = matches.filter(m => m.status === 'DELIVERED');

          setUserData({
            id: profile.username,
            temperature: profile.temperature,
            ongoingActivities: ongoingMatches.map(m => ({
              id: m.match_id,
              title: m.lost_item?.title || '분실물 정보 없음',
              img: m.found_item?.image_url || '',
            })),
            completedActivities: completedMatches.map(m => ({
              id: m.match_id,
              title: m.lost_item?.title || '분실물 정보 없음',
              img: m.found_item?.image_url || '',
            })),
            reviews: [],
          });
        } else {
          setUserData({
            id: receivedUserId,
            temperature: 36.5,
            ongoingActivities: [],
            completedActivities: [],
            reviews: [],
          });
        }
      } catch (err) {
        alert('프로필을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [receivedUserId, isOwnProfile]);

  const handleActivityClick = (activityId) => {
    navigate('/postdetail', {
      state: { postId: activityId, isAuthor: isOwnProfile },
    });
  };

  if (isLoading || !userData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">
          프로필을 불러오는 중...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(123,143,224,0.11) 0%, rgba(70,75,170,0.04) 52%, transparent 68%)' }}
      />
      <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
        {!isOwnProfile ? (
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl active:scale-95 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="w-8" />
        )}
        <h1 className="text-sm font-black text-gray-900">
          {isOwnProfile ? '내 프로필' : `${userData.id}님의 프로필`}
        </h1>
        {isOwnProfile ? (
          <button
            onClick={() => navigate('/profileedit', { state: { userId: userData.id } })}
            className="text-xs font-bold text-gray-400 active:scale-95 transition-transform px-1"
          >
            편집
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      <div className="relative z-10 px-6 py-6 border-b border-gray-50 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shadow-sm">
                <img
                  src={isOwnProfile
                    ? (location.state?.userImg || '/images/profile.png')
                    : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                  alt="프로필 사진"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">{userData.id}</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {isOwnProfile ? '내 계정' : '상대방 프로필'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
              <span className="text-sm font-black text-primary">{userData.temperature}°</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold">매너온도</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-7 pb-24 bg-white">
        {isOwnProfile && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <h3 className="font-black text-sm text-gray-900">활동내역 · 진행중</h3>
            </div>
            {userData.ongoingActivities.length > 0 ? (
              userData.ongoingActivities.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleActivityClick(item.id)}
                  className="flex p-3 bg-gray-50 rounded-2xl items-center cursor-pointer active:scale-[0.98] transition-transform border border-gray-100"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-200 overflow-hidden mr-3 flex-shrink-0">
                    {item.img && <img src={item.img} alt="물품" className="w-full h-full object-cover" />}
                  </div>
                  <span className="text-sm font-bold text-gray-800 flex-1 truncate">{item.title}</span>
                  <span className="text-[10px] font-bold text-primary bg-primary/8 px-2 py-1 rounded-lg ml-2 flex-shrink-0">진행중</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-300 font-medium py-2 pl-3">진행 중인 내역이 없습니다.</p>
            )}
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gray-300 rounded-full" />
            <h3 className="font-black text-sm text-gray-900">활동내역 · 완료</h3>
          </div>
          {userData.completedActivities.length > 0 ? (
            userData.completedActivities.map(item => (
              <div
                key={item.id}
                onClick={() => handleActivityClick(item.id)}
                className="flex p-3 bg-gray-50 rounded-2xl items-center cursor-pointer active:scale-[0.98] transition-transform border border-gray-100"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-200 overflow-hidden mr-3 flex-shrink-0">
                  {item.img && <img src={item.img} alt="물품" className="w-full h-full object-cover" />}
                </div>
                <span className="text-sm font-bold text-gray-800 flex-1 truncate">{item.title}</span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg ml-2 flex-shrink-0">완료</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-300 font-medium py-2 pl-3">완료된 내역이 없습니다.</p>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary/40 rounded-full" />
            <h3 className="font-black text-sm text-gray-900">받은 후기</h3>
          </div>
          {userData.reviews.length > 0 ? (
            userData.reviews.map(review => (
              <div key={review.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{review.type === 'POSITIVE' ? '😊' : '🙁'}</span>
                  <span className={`text-[11px] font-black ${review.type === 'POSITIVE' ? 'text-primary' : 'text-red-400'}`}>
                    {review.type === 'POSITIVE' ? '만족' : '불만족'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{review.content}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-300 font-medium py-2 pl-3">받은 후기가 없습니다.</p>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default ProfilePage;
