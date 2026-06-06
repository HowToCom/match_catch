import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { profileApi } from '../api';

function ProfileEditPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [initialData] = useState({
    id: location.state?.userId || "차차",
    studentId: "20261234"
  });

  const [formData, setFormData] = useState({
    id: initialData.id,
    studentId: initialData.studentId,
    password: "",
    confirmPassword: ""
  });

  const [isIdChecked, setIsIdChecked] = useState(true);
  const [isStudentIdChecked, setIsStudentIdChecked] = useState(true);

  const handleIdChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, id: value });
    setIsIdChecked(value === initialData.id);
  };

  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    
    setFormData({ ...formData, studentId: onlyNumbers });
    setIsStudentIdChecked(onlyNumbers === initialData.studentId);
  };

  const checkIdDuplicate = () => {
    if (!formData.id.trim()) return alert("아이디를 입력해주세요.");
    if (formData.id === "중복맨") {
      alert("이미 존재하는 아이디입니다.");
      setIsIdChecked(false);
    } else {
      alert("사용 가능한 아이디입니다.");
      setIsIdChecked(true);
    }
  };

  const checkStudentIdDuplicate = () => {
    if (!formData.studentId.trim()) return alert("학번을 입력해주세요.");
    
    // 가상의 중복된 학번 예시
    if (formData.studentId === "20260000") {
      alert("이미 가입된 학번입니다.");
      setIsStudentIdChecked(false);
    } else {
      alert("사용 가능한 학번입니다.");
      setIsStudentIdChecked(true);
    }
  };

  const isIdValid = formData.id === initialData.id || isIdChecked;
  const isStudentIdValid = formData.studentId === initialData.studentId || isStudentIdChecked;
  
  const isPasswordValid = formData.password === formData.confirmPassword;

  const isFormValid = 
    isIdValid && 
    isStudentIdValid && 
    isPasswordValid && 
    formData.id.trim() && 
    formData.studentId.trim();

  const handleSubmit = () => {
    if (!isFormValid) return;
    alert("프로필 수정이 완료되었습니다!");
    navigate('/profile', { state: { isOwnProfile: true, userId: formData.id } });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-400 text-sm font-medium hover:text-black transition-colors"
        >
          취소
        </button>
        <h1 className="text-base font-bold text-gray-900">프로필 수정</h1>
        <button 
          disabled={!isFormValid}
          onClick={handleSubmit}
          className={`text-sm font-bold transition-colors ${isFormValid ? 'text-primary hover:opacity-80' : 'text-gray-300 cursor-not-allowed'}`}
        >
          완료
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 bg-white overflow-y-auto pb-24">

        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold block">아이디</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={formData.id}
              onChange={handleIdChange}
              className="flex-1 p-3 bg-gray-100 rounded-lg outline-none text-sm font-medium"
              placeholder="변경할 아이디 입력"
            />
            {formData.id !== initialData.id && (
              <button 
                onClick={checkIdDuplicate}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isIdChecked ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {isIdChecked ? '확인 완료' : '중복 확인'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold block">새 비밀번호</label>
          <input 
            type="password" 
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 bg-gray-100 rounded-lg outline-none text-sm font-medium"
            placeholder="변경할 새 비밀번호 입력"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-bold block">새 비밀번호 재확인</label>
          <input 
            type="password" 
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full p-3 bg-gray-100 rounded-lg outline-none text-sm font-medium"
            placeholder="새 비밀번호 다시 입력"
          />
          
          {formData.confirmPassword && (
            formData.password === formData.confirmPassword ? (
              <p className="text-xs text-green-500 font-medium mt-1">✓ 비밀번호가 일치합니다.</p>
            ) : (
              <p className="text-xs text-red-500 font-medium mt-1">✗ 비밀번호가 일치하지 않습니다.</p>
            )
          )}
        </div>

      </div>
    </Layout>
  );
}

export default ProfileEditPage;