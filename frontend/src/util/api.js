// utils/api.js
// 최종 수정일: 2026-01-12
// API 응답 형태(Array / Pagination Object) 방어 유틸

export const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };  