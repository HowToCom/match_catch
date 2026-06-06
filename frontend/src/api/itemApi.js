import { BASE_URL } from './index';
import { tokenStorage } from './authApi';

const authHeader = () => ({
  Authorization: `Bearer ${tokenStorage.get()}`,
});

export const analyzeImage = async (base64Image, mimeType) => {
  const res = await fetch(`${BASE_URL}/ai/analyze`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, mime_type: mimeType }),
  });
  if (!res.ok) throw new Error('이미지 분석 실패');
  const json = await res.json();
  return json.data;
};

export const itemApi = {
  registerFoundItem: async ({ description, found_location, found_time, imageFile }) => {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('found_location', found_location);
    formData.append('found_time', found_time);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`${BASE_URL}/found-items`, {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) throw new Error('습득물 등록 실패');
    const json = await res.json();
    return json.data;
  },

  registerLostItem: async ({ title, description, keywords, lost_location, lost_time, imageFile }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('keywords', JSON.stringify(keywords));
    formData.append('lost_location', lost_location);
    formData.append('lost_time', lost_time);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`${BASE_URL}/lost-items`, {
      method: 'POST',
      headers: authHeader(),
      body: formData,
    });
    if (!res.ok) throw new Error('분실물 등록 실패');
    const json = await res.json();
    return json.data;
  },

  getFoundItemDetail: async (foundItemId) => {
    const res = await fetch(`${BASE_URL}/found-items/${foundItemId}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('습득물 조회 실패');
    const json = await res.json();
    const d = json.data;
    return {
      id: d.found_item_id,
      mode: 'found',
      title: '습득물',
      content: d.description,
      location: d.found_location,
      time: d.found_time,
      imageUrl: d.image_url,
      status: d.status,
      author: { id: '', temperature: 0 },
    };
  },

  getLostItemDetail: async (lostItemId) => {
    const res = await fetch(`${BASE_URL}/lost-items/${lostItemId}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('분실물 조회 실패');
    const json = await res.json();
    const d = json.data;
    return {
      id: d.lost_item_id,
      mode: 'lost',
      title: d.title,
      content: d.description,
      keywords: Array.isArray(d.keywords) ? d.keywords.join(', ') : d.keywords,
      location: d.lost_location,
      time: d.lost_time,
      imageUrl: d.image_url,
      status: d.status,
      author: { id: '', temperature: 0 },
    };
  },

  getSimilarFoundItems: async (lostItemId) => {
    const res = await fetch(`${BASE_URL}/lost-items/${lostItemId}/similar-found-items`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('유사 습득물 조회 실패');
    const json = await res.json();
    return json.data.map(item => ({
      id: item.found_item_id,
      content: item.description,
      keywords: Array.isArray(item.matched_keywords) ? item.matched_keywords.join(', ') : '',
      img: item.image_url,
      similarity_score: item.similarity_score * 100,
      location: item.found_location,
    }));
  },
};
