import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import StudentForm from "../components/StudentForm";
import axios from "axios";

function DashboardOwner() {
  const navigate = useNavigate();

  // ✅ 2026/01/12: students는 항상 배열로 유지 (map 안전)
  const [students, setStudents] = useState([]);

  const handleLogout = () => {
    // 로컬스토리지 초기화
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");

    // 로그인 페이지로 이동
    navigate("/login");
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/api/students/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      // ✅ 2026/01/12: API 응답이 배열이 아닐 경우 방어
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("학생 목록 불러오기 실패:", error);

      // ✅ 2026/01/12: 에러 발생 시에도 화면 깨지지 않도록 초기화
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/api/students/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      fetchStudents(); // 새로고침
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1>📊 Owner Dashboard</h1>
      <p>여기는 Owner 전용 대시보드입니다.</p>

      {/* 학생 등록 폼 */}
      <section>
        <h3>학생 등록</h3>
        <StudentForm onStudentAdded={fetchStudents} />
      </section>

      {/* 학생 목록 */}
      <section style={{ marginTop: "30px" }}>
        <h2>학생 목록</h2>

        {/* ✅ 2026/01/12: 학생이 0명일 때 UX 처리 */}
        {students.length === 0 ? (
          <p style={{ color: "#777" }}>📭 등록된 학생이 없습니다.</p>
        ) : (
          <ul>
            {students.map((s) => (
              <li key={s.id} style={{ marginBottom: "10px" }}>
                {s.user?.full_name} ({s.user?.email})
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => handleDelete(s.id)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 로그아웃 */}
      <div style={{ marginTop: "30px" }}>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
}

export default DashboardOwner;
