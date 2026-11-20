import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import StudentTable from "../components/StudentTable";
import StudentForm from "../components/StudentForm";
import DeleteConfirmation from "../components/DeleteConfirmation";

function StudentList({
  students,
  onNavigate,
  onViewStudent,
  onUpdateStudent,
  onDeleteStudent,
  user,
  notifications = [],
}) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState("");

  const departments = [...new Set(
    students.map((student) => student.department).filter(Boolean)
  )].sort();
  const courses = [...new Set(
    students.map((student) => student.course).filter(Boolean)
  )].sort();
  const years = [...new Set(
    students.map((student) => student.year).filter(Boolean)
  )].sort();

  const filteredStudents = students
    .filter((student) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        String(student.name || "").toLowerCase().includes(query) ||
        String(student.registerNo || "").toLowerCase().includes(query);

      return (
        matchesSearch &&
        (!departmentFilter || student.department === departmentFilter) &&
        (!courseFilter || student.course === courseFilter) &&
        (!yearFilter || student.year === yearFilter)
      );
    })
    .sort((first, second) => {
      switch (sortBy) {
        case "name-desc":
          return String(second.name || "").localeCompare(String(first.name || ""));
        case "register-asc":
          return String(first.registerNo || "").localeCompare(String(second.registerNo || ""));
        case "register-desc":
          return String(second.registerNo || "").localeCompare(String(first.registerNo || ""));
        case "department":
          return String(first.department || "").localeCompare(String(second.department || ""));
        case "year":
          return String(first.year || "").localeCompare(String(second.year || ""));
        case "newest":
          return (
            (Date.parse(second.registeredAt || "") || Number(second.id) || 0) -
            (Date.parse(first.registeredAt || "") || Number(first.id) || 0)
          );
        case "name-asc":
        default:
          return String(first.name || "").localeCompare(String(second.name || ""));
      }
    });

  async function handleUpdate(updatedStudent) {
    const duplicateRegisterNumber = students.some(
      (student) =>
        student.id !== editingStudent.id &&
        String(student.registerNo || "").trim().toLowerCase() ===
          updatedStudent.registerNo.trim().toLowerCase()
    );

    if (duplicateRegisterNumber) {
      setFeedback("That register number is already assigned to another student.");
      return false;
    }

    try {
      await onUpdateStudent(editingStudent.id, updatedStudent);
      setFeedback(`${updatedStudent.name} was updated successfully.`);
      return true;
    } catch (error) {
      setFeedback(error.message);
      return false;
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await onDeleteStudent(deleteTarget.id);
      setFeedback(`${deleteTarget.name} was deleted.`);
      setDeleteTarget(null);
    } catch (error) {
      setFeedback(error.message);
    }
  }

  return (
    <div>
      <Navbar onNavigate={onNavigate} user={user} notifications={notifications} />

      <div className="dashboard-layout">
        <Sidebar activePage="students" onNavigate={onNavigate} role={user?.role} />

        <main className="dashboard-content student-list-page">
          <div className="student-list-heading">
            <div>
              <p className="welcome-small">STUDENT MANAGEMENT</p>
              <h1>All Students</h1>
              <p>Search, filter, and manage student records.</p>
            </div>
            <button
              type="button"
              className="quick-action primary"
              onClick={() => onNavigate?.("register")}
            >
              <span aria-hidden="true">＋</span> Register Student
            </button>
          </div>

          <section className="student-controls" aria-label="Student list controls">
            <SearchBar search={search} setSearch={setSearch} />

            <div className="student-filter-grid">
              <label>
                <span>Department</span>
                <select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                >
                  <option value="">All departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Course</span>
                <select
                  value={courseFilter}
                  onChange={(event) => setCourseFilter(event.target.value)}
                >
                  <option value="">All courses</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Academic year</span>
                <select
                  value={yearFilter}
                  onChange={(event) => setYearFilter(event.target.value)}
                >
                  <option value="">All years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Sort by</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="name-asc">Name (A to Z)</option>
                  <option value="name-desc">Name (Z to A)</option>
                  <option value="register-asc">Register number (ascending)</option>
                  <option value="register-desc">Register number (descending)</option>
                  <option value="department">Department</option>
                  <option value="year">Academic year</option>
                  <option value="newest">Recently registered</option>
                </select>
              </label>
            </div>

            <p className="student-results-count">
              Showing <strong>{filteredStudents.length}</strong> of{" "}
              <strong>{students.length}</strong> students
            </p>
          </section>

          {feedback && (
            <p className="student-list-feedback" role="status">{feedback}</p>
          )}

          <StudentTable
            students={filteredStudents}
            onView={onViewStudent}
            onEdit={(student) => {
              setFeedback("");
              setEditingStudent(student);
            }}
            onDelete={(student) => {
              setFeedback("");
              setDeleteTarget(student);
            }}
          />
        </main>
      </div>

      {editingStudent && (
        <div className="student-modal-backdrop">
          <section
            className="student-edit-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editingStudent.name}`}
          >
            <button
              type="button"
              className="student-modal-close"
              aria-label="Close edit form"
              onClick={() => setEditingStudent(null)}
            >
              ×
            </button>
            <StudentForm
              initialData={editingStudent}
              onSubmit={handleUpdate}
              onCancel={() => setEditingStudent(null)}
              user={user}
            />
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="student-modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Confirm deleting ${deleteTarget.name}`}
          >
            <DeleteConfirmation
              student={deleteTarget}
              onConfirm={confirmDelete}
              onCancel={() => setDeleteTarget(null)}
            />
          </section>
        </div>
      )}
    </div>
  );
}

export default StudentList;
