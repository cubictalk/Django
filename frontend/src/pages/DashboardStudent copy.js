// src/pages/DashboardStudent.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function DashboardStudent() {
  const navigate = useNavigate();
  const [essay, setEssay] = useState("");
  const [studentName, setStudentName] = useState("");
  const [level, setLevel] = useState("");   // 🆕 학생 레벨
  const [title, setTitle] = useState("");   // 🆕 더미 에세이 제목
  const [loading, setLoading] = useState(true); // 🆕

  useEffect(() => {
    // JWT payload에서 full_name 추출
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setStudentName(payload.full_name || "학생");

        // 🆕 API 호출 (학생 레벨 + 더미 에세이 타이틀 가져오기)
        axios
          .get("http://localhost:8000/dummy-essay-title/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setLevel(res.data.level);
            setTitle(res.data.title);
          })
          .catch((err) => {
            console.error("에세이 타이틀 불러오기 실패:", err);
          })
          .finally(() => setLoading(false));
      } catch (e) {
        console.error("토큰 파싱 실패:", e);
        setStudentName("학생");
        setLoading(false);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSend = () => {
    if (!essay.trim()) {
      alert("에세이를 작성해주세요.");
      return;
    }
    // TODO: 나중에 API로 POST 요청 (Essay + title 저장)
    console.log("학생 에세이 제출:", { title, essay });
    alert("에세이가 제출되었습니다! (더미 피드백: 잘 썼어요 👍)");
    setEssay(""); // 입력창 초기화
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (loading) return <p>대시보드 불러오는 중...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1>학생 대시보드</h1>
      <p>
        안녕하세요, <strong>{studentName}</strong>님 👋
      </p>

      {/* 🆕 학생 레벨과 AI 더미 타이틀 표시 */}
      <section style={{ marginTop: "20px", padding: "15px", border: "1px solid #ddd" }}>
        <p><strong>📖 Level:</strong> {level}</p>
        <p><strong>📝 Essay Title:</strong> {title}</p>
      </section>

      <section style={{ marginTop: "20px" }}>
        <h3>✍️ 에세이 작성</h3>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="에세이를 작성하세요..."
          rows={8}
          style={{ width: "100%", padding: "10px" }}
        />
        <br />
        <button onClick={handleSend} style={{ marginTop: "10px" }}>
          Send
        </button>
      </section>

      <div style={{ marginTop: "30px" }}>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
}

export default DashboardStudent;
