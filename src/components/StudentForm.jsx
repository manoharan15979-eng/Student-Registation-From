
import { useState } from "react";
import "../styles/StudentForm.css";

function StudentForm({
  onSubmit,
  initialData,
  onCancel,
  onClear,
  nextRegisterNumber = "",
  user,
}) {
  const createFormData = (student = {}, registerNumber = nextRegisterNumber) => ({
    name: student.name || "",
    registerNo: student.registerNo || registerNumber,
    department: student.department || "",
    course: student.course || "",
    year: student.year || "I Year",
    email: student.email || "",
    phone: student.phone || "",
    dateOfBirth: String(student.dateOfBirth || student.dob || "").slice(0, 10),
    gender: student.gender || "",
    address: student.address || "",
    status: student.status || "Active",
    photo: student.photo || "",
  });
  const [photoFile, setPhotoFile] = useState(null);

  const [formData, setFormData] = useState(() => createFormData(initialData));
  const [photoError, setPhotoError] = useState("");
  const [validationError, setValidationError] = useState("");

  const currentDate = new Date();
  const maxBirthDate = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  function handleChange(e) {
    const { name, value } = e.target;
    setValidationError("");
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    setPhotoError("");
    setPhotoFile(null);
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Please select a JPG, PNG, or WebP image.");
      setFormData((previous) => ({ ...previous, photo: initialData?.photo || "" }));
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Please select an image smaller than 2 MB.");
      setFormData((previous) => ({ ...previous, photo: initialData?.photo || "" }));
      e.target.value = "";
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setPhotoError("The selected image could not be loaded.");
        setPhotoFile(null);
        setFormData((previous) => ({ ...previous, photo: initialData?.photo || "" }));
        return;
      }
      setFormData((previous) => ({
        ...previous,
        photo: reader.result,
      }));
    };

    reader.onerror = () => {
      setPhotoError("The selected image could not be loaded.");
      setPhotoFile(null);
      setFormData((previous) => ({ ...previous, photo: initialData?.photo || "" }));
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError("");

    if (!formData.name.trim() || !formData.address.trim()) {
      setValidationError("Please enter the student's name and residential address.");
      return;
    }

    if (formData.dateOfBirth > maxBirthDate) {
      setValidationError("Date of birth cannot be in the future.");
      return;
    }

    try {
      const submittedNextRegisterNumber = await onSubmit({ ...formData, photoFile });
      if (submittedNextRegisterNumber === false) return;

      if (initialData) {
        onCancel?.();
        return;
      }

      setFormData(
        createFormData(
          {},
          typeof submittedNextRegisterNumber === "string"
            ? submittedNextRegisterNumber
            : nextRegisterNumber
        )
      );
      setPhotoFile(null);
      setPhotoError("");
    } catch (error) {
      setValidationError(error.message);
    }
  }

  function handleReset() {
    setFormData(createFormData());
    setPhotoFile(null);
    setPhotoError("");
    setValidationError("");
    onClear?.();
  }

  return (
    <form className="student-form registration-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <span className="form-label">STUDENT PORTAL</span>
          <h2>{initialData ? "Edit Student Details" : "Student Registration"}</h2>
          <p>
            {initialData
              ? "Update the student's details and photograph."
              : "Enter the student's information below."}
          </p>
        </div>
        <span className="form-heading-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="m2.5 8.5 9.5-4.5 9.5 4.5-9.5 4.5-9.5-4.5Z" />
            <path d="M6 10.2v4.5c3.7 2.7 8.3 2.7 12 0v-4.5" />
            <path d="M21.5 8.5v5" />
            <circle cx="21.5" cy="15.2" r="1" />
          </svg>
        </span>
      </div>

      {validationError && (
        <p className="form-validation-error" role="alert">{validationError}</p>
      )}

      <section className="photo-upload-section">
        <div className="photo-preview">
          {formData.photo ? (
            <img src={formData.photo} alt="Student preview" />
          ) : (
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c.6-4.1 3.2-6.5 7-6.5s6.4 2.4 7 6.5H5Z" />
              </svg>
            </span>
          )}
        </div>

        <div className="photo-upload-info">
          <h3>Student Photograph</h3>
          <p>Upload an image (maximum 2 MB).</p>
          <label className="upload-button" htmlFor="student-photo">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4.5 7.5h3l1.5-2h6l1.5 2h3A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V9a1.5 1.5 0 0 1 1.5-1.5Z" />
              <circle cx="12" cy="13" r="3.5" />
              <path d="M17.5 10h.01" />
            </svg>
            Choose Photo
            <input
              id="student-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>
          {photoError && <p className="photo-error" role="alert">{photoError}</p>}
        </div>
      </section>

      <section className="form-section">
        <h3 className="form-section-title"><span>01</span> Personal Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="student-name">Student Full Name *</label>
            <input
              id="student-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-number">Register Number (Automatic)</label>
            <input
              id="register-number"
              name="registerNo"
              value={formData.registerNo}
              readOnly
              aria-describedby="register-number-help"
              required
            />
            <small id="register-number-help">Generated automatically and checked for duplicates.</small>
          </div>

          <div className="form-group">
            <label htmlFor="student-email">Email Address *</label>
            <input
              id="student-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-phone">Phone Number *</label>
            <input
              id="student-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-gender">Gender *</label>
            <select
              id="student-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="student-date-of-birth">Date of Birth *</label>
            <input
              type="date"
              id="student-date-of-birth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={maxBirthDate}
              required
            />
          </div>
        </div>
      </section>

      {user?.role === "admin" && (
        <section className="form-section">
          <h3 className="form-section-title"><span>02</span> Academic Information</h3>
          <div className="form-grid">
          <div className="form-group">
            <label htmlFor="student-department">Department *</label>
            <select
              id="student-department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option>Computer Science</option>
              <option>Information Technology</option>
              <option>Artificial Intelligence</option>
              <option>Data Science</option>
              <option>Commerce</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="student-course">Course *</label>
            <input
              id="student-course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Enter course name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student-year">Academic Year *</label>
            <select
              id="student-year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option>I Year</option>
              <option>II Year</option>
              <option>III Year</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="student-status">Student Status</label>
            <select
              id="student-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          </div>
        </section>
      )}

      <section className="form-section">
        <h3 className="form-section-title"><span>03</span> Contact Information</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="student-address">Residential Address *</label>
            <textarea
              id="student-address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              rows="3"
              required
            />
          </div>
        </div>
      </section>

      <div className="form-actions">
        {!initialData && (
          <button type="reset" className="clear-button" onClick={handleReset}>
            Clear Form
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}

        <button type="submit" className="submit-button">
          {initialData ? "Update Student" : "Register Student"}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
