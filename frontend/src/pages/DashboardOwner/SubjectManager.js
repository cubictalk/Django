// ✅ Final Version
// ✅ Last Updated: 2026-01-13
// - Environment-based API_BASE_URL 적용
// - normalizeList 로 map is not array 방어
// - 배포 / 로컬 API 응답 차이 대응
// - CRUD 안정성 강화
// - ✅ 렌더 단계 map crash 완전 차단 (React 안정성 핵심)

import React, { useState, useEffect } from "react";
import axios from "axios";
import { normalizeList } from "../../utils/api"; // ✅ 2026-01-13 공통 방어 유틸 유지

function SubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: "", description: "" });
  const [editingSubject, setEditingSubject] = useState(null);
  const [editData, setEditData] = useState({ name: "", description: "" });

  // ✅ 2026-01-13
  // 로컬 / Vercel / Fly.io 환경 분리 대응
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // ✅ 2026-01-13
  // 과목 목록 조회 (Array / pagination / 단일 객체 모두 대응)
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/subjects/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      // ✅ map is not array 방어 (데이터 레벨)
      setSubjects(normalizeList(res.data));
    } catch (error) {
      console.error("❌ 과목 목록 불러오기 실패:", error);
      setSubjects([]); // ✅ UI 크래시 방지
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ✅ 신규 과목 입력 처리
  const handleInputChange = (e) => {
    setNewSubject({
      ...newSubject,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ 과목 생성
  const handleCreate = async () => {
    if (!newSubject.name.trim()) {
      alert("과목 이름을 입력하세요.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/subjects/`,
        newSubject,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setNewSubject({ name: "", description: "" });
      fetchSubjects();
      alert("✅ 과목이 추가되었습니다.");
    } catch (error) {
      console.error("❌ 과목 추가 실패:", error);
      alert("❌ 과목 추가 실패");
    }
  };

  // ✅ 과목 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/subjects/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      fetchSubjects();
      alert("🗑️ 삭제 완료");
    } catch (error) {
      console.error("❌ 삭제 실패:", error);
      alert("❌ 삭제 실패");
    }
  };

  // ✅ 수정 모드 진입
  const handleEdit = (subject) => {
    setEditingSubject(subject.id);
    setEditData({
      name: subject.name,
      description: subject.description || "",
    });
  };

  // ✅ 수정 입력 변경
  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ 수정 저장
  const handleEditSubmit = async (id) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/subjects/${id}/`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setEditingSubject(null);
      fetchSubjects();
      alert("✅ 수정 완료");
    } catch (error) {
      console.error("❌ 수정 실패:", error);
      alert("❌ 수정 실패");
    }
  };

  return (
    <section>
      <h3>과목 관리</h3>

      {/* ✅ 과목 추가 */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="name"
          value={newSubject.name}
          onChange={handleInputChange}
          placeholder="과목 이름"
        />
        <input
          type="text"
          name="description"
          value={newSubject.description}
          onChange={handleInputChange}
          placeholder="설명 (선택)"
        />
        <button onClick={handleCreate}>추가</button>
      </div>

      {/* ✅ 과목 목록 */}
      {/* ✅ 2026-01-13: 렌더 단계 방어 (map crash 완전 차단) */}
      <ul>
        {Array.isArray(subjects) && subjects.length > 0 ? (
          subjects.map((s) => (
            <li key={s.id} style={{ marginBottom: "12px" }}>
              {editingSubject === s.id ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    placeholder="과목 이름"
                  />
                  <input
                    type="text"
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    placeholder="설명"
                  />
                  <button onClick={() => handleEditSubmit(s.id)}>확인</button>
                  <button onClick={() => setEditingSubject(null)}>취소</button>
                </>
              ) : (
                <>
                  <strong>{s.name}</strong>{" "}
                  {s.description && <em>({s.description})</em>}{" "}
                  <button onClick={() => handleEdit(s)}>수정</button>
                  <button onClick={() => handleDelete(s.id)}>삭제</button>
                </>
              )}
            </li>
          ))
        ) : (
          // ✅ 데이터 없음 / 토큰 만료 / 권한 문제 모두 안전 처리
          <li style={{ color: "#999" }}>과목이 없습니다.</li>
        )}
      </ul>
    </section>
  );
}

export default SubjectManager;
