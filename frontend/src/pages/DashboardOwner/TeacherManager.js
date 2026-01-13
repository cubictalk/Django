// TeacherManager.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherForm from "../../components/TeacherForm";
import { normalizeList } from "../../utils/api";

/**
 * TeacherManager
 * 최종 수정일: 2026-01-12
 *
 * [수정 내용]
 * - normalizeList 유틸 적용 → teachers.map 에러 완전 방지
 * - API_BASE_URL 환경변수 기반 절대경로 사용 (Vercel / Fly.io 대응)
 * - subjects / teachers 모두 방어 로직 적용
 *
 * [유지 사항]
 * - JWT 인증 방식
 * - 교사/과목 CRUD
 * - teacher.subjects 배열 구조 유지 (첫 번째 과목 사용)
 */

function TeacherManager() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editData, setEditData] = useState({});

  // ✅ 2026-01-12: 배포/로컬 환경 분리 대응
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  /* ======================
     Fetch Teachers
     ====================== */
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/teachers/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      // ✅ 방어 처리 (Array / pagination / unexpected)
      setTeachers(normalizeList(res.data));
    } catch (error) {
      console.error("교사 목록 불러오기 실패:", error);
      setTeachers([]); // ✅ 추가 방어
    }
  };

  /* ======================
     Fetch Subjects
     ====================== */
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

      // ✅ 방어 처리
      setSubjects(normalizeList(res.data));
    } catch (error) {
      console.error("과목 목록 불러오기 실패:", error);
      setSubjects([]); // ✅ 추가 방어
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  /* ======================
     Delete
     ====================== */
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/teachers/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      fetchTeachers();
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  /* ======================
     Edit
     ====================== */
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher.id);

    setEditData({
      full_name: teacher.user?.full_name || "",
      email: teacher.user?.email || "",
      // 기존 로직 유지: 첫 번째 과목만 사용
      subject:
        teacher.subjects?.length
          ? String(teacher.subjects[0].id)
          : "",
    });
  };

  // ✅ 2026-01-12: controlled input 안정화
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: name === "subject" ? String(value) : value,
    }));
  };

  const handleEditSubmit = async (id) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/teachers/${id}/`,
        {
          user: {
            full_name: editData.full_name,
            email: editData.email,
          },
          subject: editData.subject
            ? Number(editData.subject)
            : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setEditingTeacher(null);
      fetchTeachers();
      alert("✅ 수정 완료");
    } catch (error) {
      console.error("수정 실패:", error);
      alert("❌ 수정 실패");
    }
  };

  /* ======================
     Render
     ====================== */
  return (
    <section>
      <h3>교사 등록</h3>
      <TeacherForm
        onTeacherAdded={fetchTeachers}
        subjects={subjects}
      />

      <h3 style={{ marginTop: 24 }}>교사 목록</h3>

      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", marginTop: 10 }}
      >
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>과목</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {teachers.map((t) => (
            <tr key={t.id}>
              {editingTeacher === t.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="full_name"
                      value={editData.full_name}
                      onChange={handleEditChange}
                    />
                  </td>

                  <td>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                    />
                  </td>

                  <td>
                    <select
                      name="subject"
                      value={editData.subject}
                      onChange={handleEditChange}
                    >
                      <option value="">과목 선택</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button onClick={() => handleEditSubmit(t.id)}>
                      확인
                    </button>
                    <button onClick={() => setEditingTeacher(null)}>
                      취소
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{t.user?.full_name}</td>
                  <td>{t.user?.email}</td>
                  <td>{t.subjects?.[0]?.name || "과목 없음"}</td>
                  <td>
                    <button onClick={() => handleEdit(t)}>수정</button>
                    <button onClick={() => handleDelete(t.id)}>삭제</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default TeacherManager;