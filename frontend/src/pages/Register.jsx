import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { authApi } from '../api';

const InputField = ({ label, required, children, focused }) => (
  <div className="space-y-1.5">
    <label className={`block text-xs font-bold transition-colors ${focused ? 'text-primary' : 'text-gray-400'}`}>
      {label} {required && <span className="text-primary">*</span>}
    </label>
    {children}
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({ studentId: '', userId: '', password: '', confirmPassword: '' });
  const [isStudentIdChecked, setIsStudentIdChecked] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'studentId') {
      setFormData({ ...formData, [name]: value.replace(/[^0-9]/g, '') });
      setIsStudentIdChecked(false);
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === 'userId') setIsIdChecked(false);
    }
  };

  const checkStudentIdDuplicate = () => {
    if (!formData.studentId.trim()) return alert('학번을 입력해주세요.');
    alert('사용 가능한 학번입니다.');
    setIsStudentIdChecked(true);
  };

  const checkIdDuplicate = () => {
    if (!formData.userId.trim()) return alert('아이디를 입력해주세요.');
    alert('사용 가능한 아이디입니다.');
    setIsIdChecked(true);
  };

  const passwordMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  const isFormValid =
    formData.studentId.trim() && formData.userId.trim() && formData.password &&
    formData.confirmPassword && passwordMatch && isStudentIdChecked && isIdChecked;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    try {
      setIsLoading(true);
      await authApi.register({
        student_id: formData.studentId,
        username: formData.userId,
        password: formData.password,
      });
      alert('회원가입이 완료되었습니다!');
      navigate('/');
    } catch (error) {
      alert(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `flex-1 w-full px-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all bg-gray-50 border-2 ${
      focusedField === field ? 'border-primary bg-white shadow-sm shadow-primary/10 text-gray-800' : 'border-transparent text-gray-700 placeholder:text-gray-300'
    } disabled:opacity-50`;

  const steps = [
    { done: isStudentIdChecked },
    { done: isIdChecked },
    { done: !!(formData.password && formData.confirmPassword && passwordMatch) },
  ];

  return (
    <Layout hideNav>
      <div className="flex-1 flex flex-col bg-white h-full overflow-y-auto">
        <div className="px-6 pt-10 pb-6">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            <span className="text-xs font-bold">로그인으로 돌아가기</span>
          </button>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Join Us</p>
              <h1 className="text-2xl font-black text-gray-900">회원가입</h1>
            </div>
            <div className="flex items-center gap-1.5 pb-1">
              {steps.map((s, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${s.done ? 'w-6 bg-primary' : 'w-2 bg-gray-200'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 px-6 space-y-5 pb-10">
          <InputField label="학번" required focused={focusedField === 'studentId'}>
            <div className="flex gap-2">
              <input name="studentId" inputMode="numeric" className={inputClass('studentId')} type="text" placeholder="학번 8자리"
                value={formData.studentId} onChange={handleChange}
                onFocus={() => setFocusedField('studentId')} onBlur={() => setFocusedField(null)} disabled={isLoading} />
              <button type="button" onClick={checkStudentIdDuplicate} disabled={isLoading}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${isStudentIdChecked ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary border-2 border-transparent'}`}>
                {isStudentIdChecked ? '✓ 확인됨' : '중복확인'}
              </button>
            </div>
          </InputField>
          <InputField label="아이디" required focused={focusedField === 'userId'}>
            <div className="flex gap-2">
              <input name="userId" className={inputClass('userId')} type="text" placeholder="사용할 아이디"
                value={formData.userId} onChange={handleChange}
                onFocus={() => setFocusedField('userId')} onBlur={() => setFocusedField(null)} disabled={isLoading} />
              <button type="button" onClick={checkIdDuplicate} disabled={isLoading}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${isIdChecked ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary border-2 border-transparent'}`}>
                {isIdChecked ? '✓ 확인됨' : '중복확인'}
              </button>
            </div>
          </InputField>
          <InputField label="비밀번호" required focused={focusedField === 'password'}>
            <input name="password" className={inputClass('password')} type="password" placeholder="비밀번호 입력"
              value={formData.password} onChange={handleChange}
              onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} disabled={isLoading} />
          </InputField>
          <InputField label="비밀번호 확인" required focused={focusedField === 'confirmPassword'}>
            <input name="confirmPassword"
              className={`${inputClass('confirmPassword')} ${passwordMatch ? '!border-emerald-200 !bg-emerald-50/50' : passwordMismatch ? '!border-red-200 !bg-red-50/50' : ''}`}
              type="password" placeholder="비밀번호 재입력"
              value={formData.confirmPassword} onChange={handleChange}
              onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)} disabled={isLoading} />
            {passwordMatch && (
              <p className="text-[11px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                비밀번호가 일치합니다
              </p>
            )}
            {passwordMismatch && (
              <p className="text-[11px] text-red-400 font-bold mt-1.5 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                비밀번호가 일치하지 않습니다
              </p>
            )}
          </InputField>
          <div className="pt-4">
            <button disabled={!isFormValid || isLoading} onClick={handleRegister}
              className={`w-full py-4 rounded-2xl text-sm font-bold transition-all ${!isFormValid || isLoading ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-primary-light text-white active:scale-[0.98] shadow-lg shadow-primary/25'}`}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                  </svg>
                  가입 처리 중...
                </span>
              ) : '가입하기'}
            </button>
            {!isFormValid && (
              <p className="text-center text-[11px] text-gray-300 mt-3 font-medium">
                {!isStudentIdChecked ? '학번 중복확인을 완료해주세요' :
                 !isIdChecked ? '아이디 중복확인을 완료해주세요' :
                 passwordMismatch ? '비밀번호가 일치하지 않습니다' : '모든 항목을 입력해주세요'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
