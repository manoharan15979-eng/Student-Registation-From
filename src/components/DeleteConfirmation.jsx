
import "../styles/DeleteConfirmation.css";

function DeleteConfirmation({ student, onConfirm, onCancel }) {
  return (
    <div className="delete-confirmation">
      <span className="delete-confirmation-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path className="delete-icon-disc" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Z" />
          <path d="M8.25 8.25h7.5M10 8.25V7h4v1.25M9.25 10l.55 6h4.4l.55-6M10.75 11.75v2.75M13.25 11.75v2.75" />
        </svg>
      </span>
      <h3>Delete student?</h3>
      <p>
        Are you sure you want to delete{" "}
        <strong>{student?.name || "this student"}</strong>? This action cannot be undone.
      </p>

      <div className="delete-confirmation-actions">
        <button type="button" className="delete-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="delete-confirm" onClick={onConfirm}>
          Delete Student
        </button>
      </div>
    </div>
  );
}

export default DeleteConfirmation;
