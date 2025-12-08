// ✅ Updated: 2025-11-03
import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentForm from "../../components/StudentForm";

function StudentManager() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null); // ✅ For edit mode
  const [editData, setEditData] = useState({}); // ✅ Editable student fields

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
      fetchStudents();
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  // ✅ Start editing
  const handleEdit = (student) => {
    setEditingStudent(student.id);
    setEditData({
      full_name: student.user?.full_name || "",
      email: student.user?.email || "",
    });
  };

  // ✅ Update field in edit form
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // ✅ Submit updated info
  const handleEditSubmit = async (id) => {
    try {
      await axios.patch(
        `/api/students/${id}/`,
        { user: { full_name: editData.full_name, email: editData.email } },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setEditingStudent(null);
      fetchStudents();
      alert("✅ 수정 완료");
    } catch (error) {
      console.error("수정 실패:", error);
      alert("❌ 수정 실패");
    }
  };

  return (
    <section>
      <h3>학생 등록</h3>
      <StudentForm onStudentAdded={fetchStudents} />

      <h3>학생 목록</h3>
      <ul>
        {students.map((s) => (
          <li key={s.id} style={{ marginBottom: "12px" }}>
            {editingStudent === s.id ? (
              <>
                {/* ✅ Edit form */}
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
                <button onClick={() => handleEditSubmit(s.id)}>확인</button>
                <button onClick={() => setEditingStudent(null)}>취소</button>
              </>
            ) : (
              <>
                {s.user?.full_name} ({s.user?.email})
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

export default StudentManager;
