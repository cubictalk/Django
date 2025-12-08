// ✅ Updated: 2025-11-04
import React, { useState, useEffect } from "react";
import axios from "axios";

function SubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: "", description: "" });
  const [editingSubject, setEditingSubject] = useState(null); // ✅ 2025-11-04 edit mode
  const [editData, setEditData] = useState({ name: "", description: "" }); // ✅ 2025-11-04 edit data

  // ✅ 2025-11-04: Fetch all subjects
  const fetchSubjects = async () => {
    try {
      const res = await axios.get("/api/subjects/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setSubjects(res.data);
    } catch (error) {
      console.error("과목 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ✅ 2025-11-04: Handle input for new subject
  const handleInputChange = (e) => {
    setNewSubject({ ...newSubject, [e.target.name]: e.target.value });
  };

  // ✅ 2025-11-04: Create new subject
  const handleCreate = async () => {
    if (!newSubject.name.trim()) return alert("과목 이름을 입력하세요.");
    try {
      await axios.post(
        "/api/subjects/",
        newSubject,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setNewSubject({ name: "", description: "" });
      fetchSubjects();
      alert("✅ 과목이 추가되었습니다.");
    } catch (error) {
      console.error("과목 추가 실패:", error);
      alert("❌ 과목 추가 실패");
    }
  };

  // ✅ 2025-11-04: Delete subject
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/subjects/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      fetchSubjects();
      alert("🗑️ 삭제 완료");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("❌ 삭제 실패");
    }
  };

  // ✅ 2025-11-04: Start editing
  const handleEdit = (subject) => {
    setEditingSubject(subject.id);
    setEditData({ name: subject.name, description: subject.description || "" });
  };

  // ✅ 2025-11-04: Edit input handler
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // ✅ 2025-11-04: Submit update
  const handleEditSubmit = async (id) => {
    try {
      await axios.patch(
        `/api/subjects/${id}/`,
        editData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setEditingSubject(null);
      fetchSubjects();
      alert("✅ 수정 완료");
    } catch (error) {
      console.error("수정 실패:", error);
      alert("❌ 수정 실패");
    }
  };

  return (
    <section>
      <h3>과목 관리</h3>

      {/* ✅ 2025-11-04: Create new subject */}
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

      {/* ✅ 2025-11-04: Subject list */}
      <ul>
        {subjects.map((s) => (
          <li key={s.id} style={{ marginBottom: "12px" }}>
            {editingSubject === s.id ? (
              <>
                {/* ✅ 2025-11-04: Edit form */}
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
        ))}
      </ul>
    </section>
  );
}

export default SubjectManager;
