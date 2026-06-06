import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { itemApi, matchApi } from '../api';

function PostDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const receivedPostId = location.state?.postId;
  const receivedMode   = location.state?.mode || 'found';
  const receivedIsAuthor = location.state?.isAuthor || false;
  const isFromUpload = location.state?.isFromUpload || false;
  const myLostItemId = location.state?.myLostItemId;

  const [isAuthor] = useState(receivedIsAuthor);
  const [postData, setPostData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!receivedPostId) return;
      try {
        setIsLoading(true);
        const data = receivedMode === 'lost'
          ? await itemApi.getLostItemDetail(receivedPostId)
          : await itemApi.getFoundItemDetail(receivedPostId);
        setPostData(data);
      } catch (error) {
        console.error(error);
        alert('게시글을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostDetail();
  }, [receivedPostId, receivedMode]);

  if (!receivedPostId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <p className="text-gray-500 mb-4 font-medium">잘못된 접근입니다.</p>
        <button onClick={() => navigate('/home')} className="bg-primary px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
          홈으로 가기
        </button>
      </div>
    );
  }

  if (isLoading || !postData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 font-medium text-sm">게시글 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  const handleSendRequest = async () => {
    if (!myLostItemId) {
      alert('내 분실물 정보가 확인되지 않습니다. 검색을 다시 진행해주세요.');
      return;
    }
    if (window.confirm('습득자에게 매칭 요청을 보내시겠습니까?')) {
      try {
        await matchApi.createMatch(myLostItemId, receivedPostId);
        alert('매칭 요청이 성공적으로 전송되었습니다!');
      } catch (error) {
        alert('매칭 요청 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditPost = () => {
    if (postData.status !== 'REGISTERED') {
      alert('매칭이 진행 중이거나 인도가 완료된 게시글은 수정할 수 없습니다.');
      return;
    }
    navigate('/postedit', { state: { postData } });
  };

  const handleGoProfile = () => {
    navigate('/profile', { state: { userId: postData.author.id, isOwnProfile: false } });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
        {!isFromUpload ? (
          <button onClick={() => navigate(-1)} className="p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        ) : <div className="w-8" />}

        {isAuthor ? (
          <button onClick={handleEditPost} className="bg-primary text-black px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
            게시글 수정
          </button>
        ) : (
          <button onClick={handleSendRequest} className="bg-primary text-black px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
            요청 보내기
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 pb-24 bg-white">
        <h2 className="text-center text-gray-400 text-sm font-medium">
          {isAuthor ? '본인이 올린 게시글' : '상대방이 올린 게시글'}
        </h2>

        <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center">
          <img src={postData.imageUrl} alt="물품 사진" className="w-full h-full object-cover" />
        </div>

        <div className="space-y-4">
          {postData.mode === 'lost' && (
            <div className="bg-gray-100 p-4 rounded-xl">
              <p className="text-gray-400 text-xs mb-1 font-bold">제목</p>
              <p className="font-bold text-gray-800">{postData.title}</p>
            </div>
          )}
          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-gray-400 text-xs mb-1 font-bold">내용</p>
            <p className="text-gray-800 leading-relaxed font-medium">{postData.content}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-gray-400 text-xs mb-1 font-bold">{postData.mode === 'found' ? '습득 장소' : '분실 장소'}</p>
            <p className="text-gray-800 font-medium">{postData.location || '기입 안 됨'}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-xl">
            <p className="text-gray-400 text-xs mb-1 font-bold">{postData.mode === 'found' ? '습득 시간' : '분실 시간'}</p>
            <p className="text-gray-800 font-medium">{postData.time || '기입 안 됨'}</p>
          </div>
        </div>

        <div onClick={handleGoProfile} className="flex items-center p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100">
          <div className="w-16 h-16 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden mr-4 flex items-center justify-center">
            {postData.author.profileImg && (
              <img src={postData.author.profileImg} alt="프로필" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{postData.author.id}</p>
            <p className="text-sm text-gray-500 font-medium">매너 온도 {postData.author.temperature}℃</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default PostDetailPage;
