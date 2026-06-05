import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout'; 
import { itemApi } from '../api';

function PostEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  const originalPost = location.state?.postData;
  if (!originalPost) {
    alert("게시글 정보가 없습니다.");
    navigate(-1);
  }

  const [formData, setFormData] = useState({
    title: originalPost.title || "",
    content: originalPost.content || "",
    keywords: Array.isArray(originalPost.keywords) ? originalPost.keywords.join(', ') : (originalPost.keywords || ""), 
    location: originalPost.location || "",
    time: originalPost.time || "",
    imageUrl: originalPost.imageUrl || ""
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: previewUrl });
    }
  };

  const isFormValid = 
    formData.imageUrl && 
    formData.content.trim() && 
    !isLoading && 
    (originalPost.mode === 'found' || (formData.title.trim() && formData.keywords.trim()));

  const handleSubmit = async () => {
    if (!isFormValid) return;
    if (originalPost.status !== "REGISTERED") {
      alert("매칭이 진행 중이거나 인도가 완료된 물품은 수정할 수 없습니다.");
      return;
    }

    try {
      setIsLoading(true);
      
      const updateData = {
        content: formData.content,
        location: formData.location,
        time: formData.time,
        imageUrl: formData.imageUrl
      };

      if (originalPost.mode === 'lost') {
        updateData.title = formData.title;
        updateData.keywords = formData.keywords.split(',').map(k => k.trim()); 
        await itemApi.editLostItem(originalPost.id, updateData);
      } else {
        await itemApi.editFoundItem(originalPost.id, updateData);
      }

      alert("게시글 수정이 완료되었습니다!");
      
      navigate('/postdetail', {
        state: { postId: originalPost.id, isAuthor: true, updatedPostData: updateData }
      });
    } catch (error) {
      alert("수정 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!originalPost) return null;

  return (
    <Layout>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
        <button onClick={() => navigate(-1)} disabled={isLoading} className="text-gray-400 text-sm font-medium hover:text-black disabled:opacity-50">취소</button>
        <h1 className="text-base font-bold text-gray-900">게시글 수정</h1>
        <button disabled={!isFormValid} onClick={handleSubmit} className={`text-sm font-bold ${isFormValid ? 'text-primary' : 'text-gray-300 cursor-not-allowed'}`}>
          {isLoading ? '저장 중...' : '완료'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-white pb-24">
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold block">사진 (필수)</label>
          <div onClick={() => !isLoading && fileInputRef.current.click()} className={`w-full aspect-video bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200 overflow-hidden ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
            {formData.imageUrl ? <img src={formData.imageUrl} alt="수정된 사진" className="w-full h-full object-cover" /> : <span className="text-gray-400 font-bold">사진을 선택해주세요</span>}
          </div>
        </div>

        {originalPost.mode === 'lost' && (
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold block">제목 (필수)</label>
            <input type="text" disabled={isLoading} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-gray-100 rounded-lg outline-none text-sm font-medium border-l-4 border-primary disabled:opacity-50" />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold block">상세 내용 (필수)</label>
          <textarea disabled={isLoading} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full h-28 p-3 bg-gray-100 rounded-lg outline-none resize-none text-sm font-medium border-l-4 border-primary disabled:opacity-50" />
        </div>

        {originalPost.mode === 'lost' && (
          <div className="space-y-2">
            <label className="text-xs text-gray-400 font-bold block">특징 키워드 (쉼표 구분, 필수)</label>
            <input type="text" disabled={isLoading} value={formData.keywords} onChange={e => setFormData({ ...formData, keywords: e.target.value })} placeholder="종류, 색깔, 모양 등" className="w-full p-3 bg-gray-100 rounded-lg outline-none text-sm font-medium border-l-4 border-primary disabled:opacity-50" />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold block">장소 (선택)</label>
          <input type="text" disabled={isLoading} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full p-3 bg-gray-100 rounded-lg outline-none text-sm font-medium disabled:opacity-50" />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold block">시간 (선택)</label>
          <input type="text" disabled={isLoading} value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full p-3 bg-gray-100 rounded-lg outline-none text-sm font-medium disabled:opacity-50" />
        </div>
      </div>
    </Layout>
  );
}

export default PostEditPage;