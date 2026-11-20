
import "../styles/StudentTable.css";

function StudentTable({ students, onView, onEdit, onDelete }) {
  if (students.length === 0) {
    return (
      <div className="student-table-empty">
        <span aria-hidden="true">🎓</span>
        <h2>No students found</h2>
        <p>Try changing your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="student-table">
      <table>
        <thead>
          <tr>
            <th>Register No</th>
            <th>Student</th>
            <th>Department</th>
            <th>Course</th>
            <th>Year</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.registerNo}</td>
              <td>
                <div className="student-name-cell">
                  {student.photo ? (
                    <img src={student.photo} alt="" />
                  ) : (
                    <span className="student-table-avatar" aria-hidden="true">🎓</span>
                  )}
                  <span>{student.name}</span>
                </div>
              </td>
              <td>{student.department}</td>
              <td>{student.course}</td>
              <td>{student.year}</td>
              <td>{student.status}</td>
              <td>
                <div className="student-table-actions">
                  <button
                    type="button"
                    className="view-action"
                    onClick={() => onView(student)}
                    aria-label={`View ${student.name}`}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="edit-action"
                    onClick={() => onEdit(student)}
                    aria-label={`Edit ${student.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="delete-action"
                    onClick={() => onDelete(student)}
                    aria-label={`Delete ${student.name}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;
