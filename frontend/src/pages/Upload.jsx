import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { itemApi, analyzeImage } from '../api';
import exifr from 'exifr';

// ─── 유틸 ────────────────────────────────────────────────────────────────────

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDatetime(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseToDate(str) {
  // "2026-06-02 14:30" → Date
  if (!str) return new Date();
  const [datePart, timePart] = str.split(' ');
  const [y, m, d] = (datePart || '').split('-').map(Number);
  const [h, min] = (timePart || '00:00').split(':').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, h || 0, min || 0);
  return isNaN(dt.getTime()) ? new Date() : dt;
}

// ─── Geolocation → Nominatim 역지오코딩 ────────────────────────────────────

async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('위치 서비스를 지원하지 않는 브라우저입니다.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(new Error('위치 권한이 거부되었거나 위치를 가져올 수 없습니다.')),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
  if (!res.ok) throw new Error('주소 변환 실패');
  const data = await res.json();
  // 건물명 > 도로명+번지 순으로 조합
  const addr = data.address || {};
  const parts = [
    addr.amenity || addr.building || addr.shop || addr.office,
    addr.road,
    addr.quarter || addr.neighbourhood || addr.suburb,
    addr.city || addr.town || addr.village,
  ].filter(Boolean);
  return parts.join(' ') || data.display_name || '';
}

// ─── EXIF에서 GPS + 촬영시각 추출 ───────────────────────────────────────────

async function extractExifData(file) {
  try {
    const exif = await exifr.parse(file, { gps: true, pick: ['DateTimeOriginal', 'latitude', 'longitude'] });
    if (!exif) return null;

    const result = {};

    // 촬영 시각
    if (exif.DateTimeOriginal instanceof Date) {
      result.time = formatDatetime(exif.DateTimeOriginal);
    }

    // GPS 좌표 → 주소
    if (exif.latitude && exif.longitude) {
      try {
        result.location = await reverseGeocode(exif.latitude, exif.longitude);
      } catch {
        // 역지오코딩 실패는 무시, 좌표라도 저장
        result.location = `${exif.latitude.toFixed(5)}, ${exif.longitude.toFixed(5)}`;
      }
    }

    return result;
  } catch {
    return null; // EXIF 없는 파일이면 null 반환
  }
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function DateTimePicker({ value, onChange, onClose }) {
  const initial = parseToDate(value);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth()); // 0-based
  const [selDate, setSelDate] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), initial.getDate())
  );
  const [selHour, setSelHour] = useState(initial.getHours());
  const [selMin, setSelMin] = useState(initial.getMinutes());
  const [tab, setTab] = useState('date'); // 'date' | 'time'

  const hourRef = useRef(null);
  const minRef = useRef(null);

  // 달력 날짜 계산
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (d) =>
    d &&
    selDate.getFullYear() === viewYear &&
    selDate.getMonth() === viewMonth &&
    selDate.getDate() === d;

  const isToday = (d) => {
    const t = new Date();
    return d && t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === d;
  };

  // 시간 스크롤 — 항목 클릭 시 선택
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const mins = Array.from({ length: 12 }, (_, i) => i * 5); // 5분 단위

  // 선택된 시간 항목으로 스크롤
  useEffect(() => {
    if (tab === 'time') {
      hourRef.current?.children[selHour]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const minIdx = mins.indexOf(Math.round(selMin / 5) * 5);
      if (minIdx >= 0) minRef.current?.children[minIdx]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [tab]);

  const handleConfirm = () => {
    const d = new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate(), selHour, selMin);
    onChange(formatDatetime(d));
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[412px] bg-white rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '85vh' }}>

        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* 탭 */}
        <div className="flex px-5 pt-2 pb-0 gap-2">
          {[
            { key: 'date', label: '📅 날짜' },
            { key: 'time', label: '⏰ 시간' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === t.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 현재 선택값 요약 */}
        <div className="mx-5 mt-3 px-4 py-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">선택된 날짜/시간</span>
          <span className="text-xs font-black text-primary">
            {`${selDate.getFullYear()}-${String(selDate.getMonth()+1).padStart(2,'0')}-${String(selDate.getDate()).padStart(2,'0')} ${String(selHour).padStart(2,'0')}:${String(selMin).padStart(2,'0')}`}
          </span>
        </div>

        {/* 날짜 탭 */}
        {tab === 'date' && (
          <div className="px-5 pt-3 pb-2">
            {/* 월 이동 */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 active:scale-90 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="text-sm font-black text-gray-900">
                {viewYear}년 {viewMonth + 1}월
              </span>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 active:scale-90 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d, i) => (
                <div key={d} className={`text-center text-[10px] font-bold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* 날짜 셀 */}
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((d, i) => {
                const col = i % 7;
                return (
                  <button
                    key={i}
                    disabled={!d}
                    onClick={() => d && setSelDate(new Date(viewYear, viewMonth, d))}
                    className={`relative aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-90 ${
                      !d ? '' :
                      isSelected(d) ? 'bg-primary text-white shadow-sm' :
                      isToday(d) ? 'border-2 border-primary/40 text-primary' :
                      col === 0 ? 'text-red-400' :
                      col === 6 ? 'text-blue-400' :
                      'text-gray-700'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 시간 탭 */}
        {tab === 'time' && (
          <div className="px-5 pt-3 pb-2">
            <div className="flex gap-3" style={{ height: '200px' }}>
              {/* 시 */}
              <div className="flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-gray-400 text-center mb-2">시</p>
                <div ref={hourRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-none"
                  style={{ scrollbarWidth: 'none' }}>
                  {hours.map(h => (
                    <button
                      key={h}
                      onClick={() => setSelHour(h)}
                      className={`w-full py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        selHour === h ? 'bg-primary text-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center text-gray-300 font-black text-lg pb-2">:</div>

              {/* 분 (5분 단위) */}
              <div className="flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-gray-400 text-center mb-2">분</p>
                <div ref={minRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-none"
                  style={{ scrollbarWidth: 'none' }}>
                  {mins.map(m => (
                    <button
                      key={m}
                      onClick={() => setSelMin(m)}
                      className={`w-full py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        selMin === m || (selMin >= m && selMin < m + 5 && m === mins[mins.length-1]) ? 'bg-primary text-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 확인 버튼 */}
        <div className="px-5 py-4">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-bold text-sm shadow-sm active:scale-[0.98] transition-transform"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FormRow ─────────────────────────────────────────────────────────────────

const FormRow = ({ label, required, focused, children }) => (
  <div className={`px-4 py-4 transition-colors ${focused ? 'bg-primary/[0.025]' : ''}`}>
    <label className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${focused ? 'text-primary' : 'text-gray-400'}`}>
      {label}
      {required && <span className="ml-1 text-primary">*</span>}
    </label>
    {children}
  </div>
);

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

function UploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [mode] = useState(location.state?.mode || 'found');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    keywords: '',
    location: '',
    time: '',
  });

  // 위치 가져오기
  const fetchLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const { lat, lng } = await getCurrentLocation();
      const address = await reverseGeocode(lat, lng);
      setFormData(prev => ({ ...prev, location: address }));
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    const capturedFile = location.state?.capturedFile;
    if (capturedFile) {
      processFile(capturedFile);
    }
    // 현재 시각 기본값 (위치는 버튼 탭으로만 요청 — iOS 사파리 정책)
    setFormData(prev => ({ ...prev, time: formatDatetime(new Date()) }));
  }, []);

  const processFile = async (file) => {
    setSelectedImage(URL.createObjectURL(file));
    setAnalyzeError('');
    setIsImageAnalyzing(true);
    try {
      // EXIF 추출 + AI 분석 병렬 실행
      const [exifData, aiResult] = await Promise.all([
        extractExifData(file),
        fileToBase64(file).then(base64 => analyzeImage(base64, file.type || 'image/jpeg')),
      ]);

      setFormData(prev => ({
        ...prev,
        content:  aiResult.description || prev.content,
        title:    mode === 'lost' ? (aiResult.title    || prev.title)    : prev.title,
        keywords: mode === 'lost' ? (aiResult.keywords || prev.keywords) : prev.keywords,
        // EXIF에서 읽은 값 우선 적용, 없으면 기존값 유지
        time:     exifData?.time     || prev.time,
        location: exifData?.location || prev.location,
      }));
    } catch (err) {
      setAnalyzeError(`자동 분석 실패: ${err.message} — 직접 입력해 주세요.`);
    } finally {
      setIsImageAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const isFormValid = () => {
    if (mode === 'found') return selectedImage && formData.content.trim();
    return formData.title.trim() && formData.content.trim() && formData.keywords.trim();
  };

  const handleSubmit = async () => {
    if (!isFormValid() || isSubmitting || isImageAnalyzing) return;
    setIsSubmitting(true);
    try {
      if (mode === 'found') {
        const response = await itemApi.registerFoundItem({
          description:    formData.content,
          found_location: formData.location,
          found_time:     formData.time,
          image:          selectedImage,
        });
        alert('습득물이 성공적으로 등록되었습니다.');
        navigate('/postdetail', {
          state: { postId: response.found_item_id, isAuthor: true, isFromUpload: true },
        });
      } else {
        const registerResponse = await itemApi.registerLostItem({
          title:         formData.title,
          description:   formData.content,
          keywords:      formData.keywords.split(',').map(k => k.trim()),
          lost_location: formData.location,
          lost_time:     formData.time,
          image:         selectedImage,
        });
        const searchResults = await itemApi.getSimilarFoundItems(registerResponse.lost_item_id);
        navigate('/searchresult', {
          state: { results: searchResults, lostItemId: registerResponse.lost_item_id },
        });
      }
    } catch {
      alert('서버 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || isImageAnalyzing;

  const pickerModal = showPicker ? (
    <DateTimePicker
      value={formData.time}
      onChange={v => setFormData(prev => ({ ...prev, time: v }))}
      onClose={() => setShowPicker(false)}
    />
  ) : null;

  return (
    <Layout modal={pickerModal}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
        <button onClick={() => navigate(-1)} disabled={isDisabled}
          className="p-2 -ml-2 rounded-xl disabled:opacity-40 active:scale-95 transition-transform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-gray-900">
            {mode === 'found' ? '습득물 등록' : '분실물 찾기'}
          </span>
          <div className="flex gap-1 mt-1">
            <div className={`h-0.5 w-8 rounded-full ${mode === 'found' ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`h-0.5 w-8 rounded-full ${mode === 'lost' ? 'bg-primary' : 'bg-gray-200'}`} />
          </div>
        </div>

        <button disabled={!isFormValid() || isDisabled} onClick={handleSubmit}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${
            !isFormValid() || isDisabled
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-primary-light text-white shadow-sm shadow-primary/25'
          }`}>
          {isSubmitting
            ? (mode === 'found' ? '등록 중...' : '검색 중...')
            : (mode === 'found' ? '등록 완료' : '검색하기')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gray-50 pb-24">

        {/* 이미지 업로드 */}
        <div
          onClick={() => !isDisabled && fileInputRef.current?.click()}
          className={`w-full aspect-video rounded-2xl overflow-hidden transition-all active:scale-[0.99] ${
            isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          } ${selectedImage ? 'shadow-md' : 'border-2 border-dashed bg-white shadow-sm border-gray-200'}`}
        >
          {selectedImage ? (
            <div className="relative w-full h-full">
              <img src={selectedImage} alt="선택된 사진" className="w-full h-full object-cover" />
              {!isDisabled && (
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <span className="text-white text-xs font-bold bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
                    탭하여 사진 변경
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#464BAA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <p className="text-gray-400 text-xs font-semibold">
                {mode === 'found' ? '사진 첨부 (필수)' : '참고 사진 첨부 (선택)'}
              </p>
            </div>
          )}
        </div>

        {/* AI 분석 중 */}
        {isImageAnalyzing && (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3.5">
            <svg className="animate-spin w-4 h-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            <div>
              <p className="text-primary text-xs font-bold">AI가 사진을 분석하는 중...</p>
              <p className="text-primary/60 text-[10px] font-medium mt-0.5">잠시만 기다려 주세요</p>
            </div>
          </div>
        )}

        {analyzeError && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-2xl px-4 py-3.5">
            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-red-400 text-xs font-medium">{analyzeError}</p>
          </div>
        )}

        {/* 폼 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div className="divide-y divide-gray-50">

            {mode === 'lost' && (
              <FormRow label="제목" required focused={focusedField === 'title'}>
                <input type="text" placeholder="물품 제목을 입력하세요" disabled={isDisabled}
                  className="w-full mt-1.5 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-300 disabled:opacity-50"
                  value={formData.title}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </FormRow>
            )}

            <FormRow label="상세 내용" required focused={focusedField === 'content'}>
              <textarea placeholder="물품에 대한 상세 설명을 입력하세요" disabled={isDisabled}
                className="w-full mt-1.5 h-24 bg-transparent outline-none resize-none text-sm text-gray-800 placeholder:text-gray-300 disabled:opacity-50"
                value={formData.content}
                onFocus={() => setFocusedField('content')}
                onBlur={() => setFocusedField(null)}
                onChange={e => setFormData({ ...formData, content: e.target.value })} />
            </FormRow>

            {mode === 'lost' && (
              <FormRow label="키워드 · 쉼표로 구분" required focused={focusedField === 'keywords'}>
                <input type="text" placeholder="예: 지갑, 검정, 가죽" disabled={isDisabled}
                  className="w-full mt-1.5 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-300 disabled:opacity-50"
                  value={formData.keywords}
                  onFocus={() => setFocusedField('keywords')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })} />
              </FormRow>
            )}

            {/* 장소 — 위치 버튼 포함 */}
            <FormRow
              label={mode === 'found' ? '습득 장소 · 선택' : '분실 예상 장소 · 선택'}
              focused={focusedField === 'location'}
            >
              <div className="flex items-start gap-2 mt-1.5">
                <input type="text"
                  placeholder={isLocating ? '위치를 가져오는 중...' : '현위치 버튼을 탭하거나 직접 입력하세요'}
                  disabled={isDisabled || isLocating}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-300 disabled:opacity-50"
                  value={formData.location}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => setFormData({ ...formData, location: e.target.value })} />
                {/* 현재 위치 재요청 버튼 */}
                <button
                  type="button"
                  onClick={fetchLocation}
                  disabled={isLocating || isDisabled}
                  className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-90 ${
                    isLocating
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {isLocating ? (
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                    </svg>
                  )}
                  현위치
                </button>
              </div>
              {locationError && (
                <p className="text-[10px] text-red-400 font-medium mt-1">{locationError} — 직접 입력해 주세요</p>
              )}
            </FormRow>

            {/* 시간 — 달력/시간 피커 버튼 */}
            <FormRow
              label={mode === 'found' ? '습득 시간 · 선택' : '분실 예상 시간 · 선택'}
              focused={focusedField === 'time'}
            >
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                disabled={isDisabled}
                onFocus={() => setFocusedField('time')}
                onBlur={() => setFocusedField(null)}
                className="w-full mt-1.5 flex items-center justify-between group disabled:opacity-50"
              >
                <span className={`text-sm font-medium ${formData.time ? 'text-gray-800' : 'text-gray-300'}`}>
                  {formData.time || '날짜/시간 선택'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-primary/70 bg-primary/8 px-2.5 py-1 rounded-lg flex-shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  변경
                </span>
              </button>
            </FormRow>

          </div>
        </div>

        {mode === 'found' && !selectedImage && (
          <p className="text-center text-[11px] text-gray-300 font-medium">
            사진을 먼저 업로드하면 AI가 자동으로 내용을 채워드려요
          </p>
        )}
      </div>
    </Layout>
  );
}

export default UploadPage;
