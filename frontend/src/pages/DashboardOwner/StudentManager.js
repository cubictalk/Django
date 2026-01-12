// ✅ Final Version
// ✅ Last Updated: 2026-01-12
// --------------------------------------------------
// Student CRUD (Create / Read / Update / Delete)
// - JWT 인증 기반 (/api/students/)
// - Tenant 기반 멀티 유저 환경 대응
// - 방어코드 추가 (null / undefined / empty 대응)
// - Vercel / Fly.io 공통 환경 대응
// --------------------------------------------------

import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentForm from "../../components/StudentForm";

// ✅ API Base URL (환경변수 없을 경우 fallback)
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "";

function StudentManager() {
  // ✅ 학생 목록 (항상 배열 유지)
  const [students, setStudents] = useState([]);

  // ✅ 수정 중인 학생 ID
  const [editingStudent, setEditingStudent] = useState(null);

  // ✅ 수정 폼 데이터
  const [editData, setEditData] = useState({
    full_name: "",
    email: "",
  });

  // ✅ Access Token 방어 처리
  const accessToken = localStorage.getItem("access");

  // --------------------------------------------------
  // ✅ 학생 목록 조회
  // --------------------------------------------------
  const fetchStudents = async () => {
    if (!accessToken) {
      console.warn("⚠️ access token 없음");
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/students/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // ✅ 응답 방어 (배열 아닐 경우)
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        console.warn("⚠️ 학생 데이터가 배열이 아님:", res.data);
        setStudents([]);
      }
    } catch (error) {
      console.error("❌ 학생 목록 불러오기 실패:", error);
      setStudents([]); // 방어
    }
  };

  // --------------------------------------------------
  // ✅ 최초 로딩
  // --------------------------------------------------
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // ✅ 학생 삭제
  // --------------------------------------------------
  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/students/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      fetchStudents();
    } catch (error) {
      console.error("❌ 삭제 실패:", error);
      alert("❌ 삭제 실패");
    }
  };

  // --------------------------------------------------
  // ✅ 수정 모드 시작
  // --------------------------------------------------
  const handleEdit = (student) => {
    if (!student || !student.id) return;

    setEditingStudent(student.id);
    setEditData({
      full_name: student.user?.full_name || "",
      email: student.user?.email || "",
    });
  };

  // --------------------------------------------------
  // ✅ 수정 입력값 변경
  // --------------------------------------------------
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // ✅ 수정 저장
  // --------------------------------------------------
  const handleEditSubmit = async (id) => {
    if (!id) return;

    try {
      await axios.patch(
        `${API_BASE_URL}/api/students/${id}/`,
        {
          user: {
            full_name: editData.full_name,
            email: editData.email,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setEditingStudent(null);
      fetchStudents();
      alert("✅ 수정 완료");
    } catch (error) {
      console.error("❌ 수정 실패:", error);
      alert("❌ 수정 실패");
    }
  };

  // --------------------------------------------------
  // ✅ Render
  // --------------------------------------------------
  return (
    <section>
      {/* ✅ 학생 등록 */}
      <h3>학생 등록</h3>
      <StudentForm onStudentAdded={fetchStudents} />

      {/* ✅ 학생 목록 */}
      <h3>학생 목록</h3>

      {!Array.isArray(students) || students.length === 0 ? (
        <p style={{ color: "#777" }}>등록된 학생이 없습니다.</p>
      ) : (
        <ul>
          {students.map((s) => {
            if (!s || !s.id) return null; // ✅ map 방어

            return (
              <li key={s.id} style={{ marginBottom: "12px" }}>
                {editingStudent === s.id ? (
                  <>
                    {/* ✅ 수정 폼 */}
                    <input
                      type="text"
                      name="full_name"
                      value={editData.full_name}
                      onChange={handleEditChange}
                      placeholder="이름"
                    />
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      placeholder="이메일"
                    />
                    <button onClick={() => handleEditSubmit(s.id)}>
                      확인
                    </button>
                    <button onClick={() => setEditingStudent(null)}>
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    {s.user?.full_name || "이름 없음"} (
                    {s.user?.email || "이메일 없음"})
                    <button onClick={() => handleEdit(s)}>수정</button>
                    <button onClick={() => handleDelete(s.id)}>삭제</button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default StudentManager;
