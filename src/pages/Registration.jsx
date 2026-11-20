
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StudentForm from "../components/StudentForm";

function Registration({
  user,
  onNavigate,
  onRegister,
  students,
  nextRegisterNumber,
  notifications = [],
}) {
  const [feedback, setFeedback] = useState(null);

  async function handleRegistration(student) {
    const submittedRegisterNumber = student.registerNo.trim().toLowerCase();
    const duplicate = students.some(
      (existingStudent) =>
        String(existingStudent.registerNo || "").trim().toLowerCase() ===
        submittedRegisterNumber
    );

    if (duplicate) {
      setFeedback({
        type: "error",
        message: `Register number ${student.registerNo} is already in use.`,
      });
      return false;
    }

    try {
      const next = await onRegister(student);
      setFeedback({
        type: "success",
        message: `Student registered successfully with register number ${student.registerNo}.`,
      });
      return next;
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
      return false;
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return (
    <div>
      <Navbar onNavigate={onNavigate} user={user} notifications={notifications} />

      <div className="dashboard-layout">
        <Sidebar activePage="register" onNavigate={onNavigate} role={user?.role} />

        <main className="dashboard-content">
          <StudentForm
            onSubmit={handleRegistration}
            onClear={clearFeedback}
            nextRegisterNumber={nextRegisterNumber}
            user={user}
          />

          {feedback && (
            <p
              className={`registration-feedback registration-feedback--${feedback.type}`}
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Registration;
