// TeacherManager.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherForm from "../../components/TeacherForm";

/**
 * TeacherManager
 * 최종 수정일: 2026-01-12
 *
 * [수정 배경]
 * - Vercel 배포 환경에서 axios 상대경로("/api/...") 사용 시
 *   프론트 도메인으로 요청이 나가며 405 Method Not Allowed 발생
 * - Django(Fly.io) API 서버로 정확히 요청을 보내기 위해
 *   REACT_APP_API_BASE_URL 환경변수 기반 절대경로 사용
 *
 * [기존 로직 유지 사항]
 * - JWT 인증 방식
 * - 교사/과목 CRUD 로직
 * - subjects 배열 처리 방식
 */

function TeacherManager() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editData, setEditData] = useState({});

  // ✅ 2026-01-12
  // 환경별(API 서버 분리) 대응을 위한 base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Load teachers
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
      setTeachers(res.data);
    } catch (error) {
      console.error("교사 목록 불러오기 실패:", error);
    }
  };

  // Load subjects
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
      setSubjects(res.data);
    } catch (error) {
      console.error("과목 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

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

  // NOTE: backend returns teacher.subjects as an ARRAY
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher.id);

    setEditData({
      full_name: teacher.user?.full_name || "",
      email: teacher.user?.email || "",
      // 첫 번째 과목만 사용 (기존 로직 유지)
      subject:
        teacher.subjects && teacher.subjects.length
          ? String(teacher.subjects[0].id)
          : "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      // select 제어를 위해 subject는 string 유지
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
          // backend는 단일 subject id를 허용
          subject: editData.subject ? Number(editData.subject) : null,
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

  return (
    <section>
      <h3>교사 등록</h3>
      <TeacherForm onTeacherAdded={fetchTeachers} subjects={subjects} />

      <h3 style={{ marginTop: 24 }}>교사 목록</h3>

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: 10 }}>
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
                    <button onClick={() => handleEditSubmit(t.id)}>확인</button>
                    <button onClick={() => setEditingTeacher(null)}>취소</button>
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
