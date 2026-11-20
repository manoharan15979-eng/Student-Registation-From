import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProfileCard from "../components/ProfileCard";
import StudentForm from "../components/StudentForm";
import Footer from "../components/Footer";

function Profile({
  students,
  selectedStudentId,
  onSelectStudent,
  onUpdateStudent,
  onNavigate,
  user,
  notifications = [],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const student = students.find((item) => item.id === selectedStudentId) || students[0];

  async function handleUpdate(updatedStudent) {
    try {
      await onUpdateStudent(student.id, updatedStudent);
      setFeedback("Student profile updated successfully.");
      return true;
    } catch (error) {
      setFeedback(error.message);
      return false;
    }
  }

  return (
    <div>
      <Navbar onNavigate={onNavigate} user={user} notifications={notifications} />

      <div className="dashboard-layout">
        <Sidebar activePage="profile" onNavigate={onNavigate} role={user?.role} />

        <main className="dashboard-content profile-page">
          <div className="profile-page-heading">
            <div>
              <p className="welcome-small">STUDENT MANAGEMENT</p>
              <h1>Student Profile</h1>
              <p>Personal, academic, and contact information.</p>
            </div>
            {students.length > 1 && (
              <label className="profile-student-picker">
                <span>Choose student</span>
                <select
                  value={student?.id ?? ""}
                  onChange={(event) => {
                    onSelectStudent(event.target.value);
                    setFeedback("");
                    setIsEditing(false);
                  }}
                >
                  {students.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.registerNo}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {feedback && (
            <p className="student-list-feedback" role="status">{feedback}</p>
          )}

          {!student ? (
            <section className="profile-empty">
              <span aria-hidden="true">🎓</span>
              <h2>No student profiles available</h2>
              <p>Register a student to create a profile.</p>
              <button
                type="button"
                className="quick-action primary"
                onClick={() => onNavigate?.("register")}
              >
                Register Student
              </button>
            </section>
          ) : isEditing ? (
            <StudentForm
              initialData={student}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              user={user}
            />
          ) : (
            <>
              <ProfileCard student={student} />
              <div className="profile-actions">
                <button
                  type="button"
                  className="quick-action secondary"
                  onClick={() => onNavigate?.("id-card")}
                >
                  Generate ID Card
                </button>
                <button
                  type="button"
                  className="quick-action primary"
                  onClick={() => {
                    setFeedback("");
                    setIsEditing(true);
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
