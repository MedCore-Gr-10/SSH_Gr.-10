import React, { useEffect, useState } from "react";
import { getDoctors, submitReview } from "../../../services/patientApi.js";
import { useAuth } from "../../../context/authContext.jsx";
import "../../CSSpages/LeaveReview.css";

export default function LeaveReview() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // TEMPORARY: Mock doctors for frontend testing
      const mockDoctors = [
        { id: "doctor-1", first_name: "John", last_name: "Smith" },
        { id: "doctor-2", first_name: "Sarah", last_name: "Johnson" },
        { id: "doctor-3", first_name: "Michael", last_name: "Williams" },
        { id: "doctor-4", first_name: "Emily", last_name: "Brown" },
      ];
      setDoctors(mockDoctors);
      // const data = await getDoctors();
      // setDoctors(data);
      setError("");
    } catch (err) {
      setError("Failed to load doctors: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoverRating(value);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    if (rating === 0) {
      setError("Please provide a rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await submitReview({
        patient_id: user.id,
        doctor_id: selectedDoctor.id,
        rating: rating,
        comment: comment,
      });

      setSuccess("Review submitted successfully!");
      setSelectedDoctor(null);
      setRating(0);
      setComment("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to submit review: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const displayRating = hoverRating || rating;

    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className="star-wrapper"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const isHalf = x < rect.width / 2;
              setHoverRating(isHalf ? star - 0.5 : star);
            }}
            onMouseLeave={() => setHoverRating(0)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const isHalf = x < rect.width / 2;
              handleStarClick(isHalf ? star - 0.5 : star);
            }}
          >
            <span className="star-background">★</span>
            <span
              className="star-fill"
              style={{
                width:
                  displayRating >= star
                    ? "100%"
                    : displayRating > star - 1
                      ? "50%"
                      : "0%",
              }}
            >
              ★
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="leave-review-container">
      <div className="leave-review-card">
        <h1 className="leave-review-title">Leave a Review!</h1>

        <form onSubmit={handleSubmitReview} className="leave-review-form">
          {/* Doctor Dropdown */}
          <div className="form-group">
            <label htmlFor="doctor-select" className="form-label">
              Select a Doctor
            </label>
            <select
              id="doctor-select"
              className="doctor-dropdown"
              value={selectedDoctor?.id || ""}
              onChange={(e) => {
                const doctor = doctors.find(
                  (d) => d.id === e.target.value
                );
                setSelectedDoctor(doctor || null);
              }}
              disabled={loading || doctors.length === 0}
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Star Rating - Only show if doctor is selected */}
          {selectedDoctor && (
            <div className="form-group stars-group">
              <label className="form-label">Rating</label>
              <div className="stars-animation">{renderStars()}</div>
              <p className="rating-display">
                {rating > 0 ? `${rating} Star${rating !== 1 ? "s" : ""}` : "Select a rating"}
              </p>
            </div>
          )}

          {/* Comment Text Box */}
          {selectedDoctor && (
            <div className="form-group">
              <label htmlFor="comment-box" className="form-label">
                Your Review
              </label>
              <textarea
                id="comment-box"
                className="comment-box"
                placeholder="Share your experience with this doctor..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                disabled={loading}
              />
              <p className="char-count">
                {comment.length} / 500 characters
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Success Message */}
          {success && <div className="success-message">{success}</div>}

          {/* Submit Button */}
          {selectedDoctor && (
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}