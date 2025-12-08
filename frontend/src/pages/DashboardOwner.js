import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import StudentForm from "../components/StudentForm";
import axios from "axios";

function DashboardOwner() {
  const navigate = useNavigate();
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
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setStudents(res.data);
    } catch (error) {
      console.error("학생 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/students/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      fetchStudents(); // 새로고침
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1>📊 Owner Dashboard</h1>
      <p>여기는 Owner 전용 대시보드입니다1.</p>
      <h2>📘 Owner 대시보드</h2>

      {/* 학생 등록 폼 */}
      <section>
        <h3>학생 등록</h3>
        <StudentForm onStudentAdded={fetchStudents} />
      </section>
      
      {/* 학생 목록 */}
      <h2>학생 목록</h2>
      <ul>
        {students.map((s) => (
          <li key={s.id}>
            {s.user?.full_name} ({s.user?.email})
            <button onClick={() => handleDelete(s.id)}>삭제</button>
          </li>
        ))}
      </ul>

      {/* 로그아웃 */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
}

export default DashboardOwner;
