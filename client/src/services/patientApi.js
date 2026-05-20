const API = "http://localhost:3000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const handleResponse = async (response) => {
  const text = await response.text();
  let payload;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server error (${response.status}): ${text}`);
  }

  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  }

  return payload.data ?? payload;
};

/**
 * Get list of doctors with their profile information (first_name, last_name)
 * Fetches staff/doctors from the hospital
 */
export const getDoctors = async () => {
  try {
    const response = await fetch(`${API}/patient/doctors`, {
      method: "GET",
      headers: getHeaders(),
    });
    
    // If patient endpoint exists, use it
    if (response.ok) {
      return handleResponse(response);
    }
    
    // If patient endpoint doesn't exist (404), try director endpoint
    if (response.status === 404) {
      console.warn("Patient doctors endpoint not found, trying director staff endpoint...");
      const directorResponse = await fetch(`${API}/director/staff`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(directorResponse);
    }
    
    // For other errors, throw normally
    return handleResponse(response);
  } catch (err) {
    console.error("Error fetching doctors:", err.message);
    throw new Error("Unable to fetch doctors. Please ensure the server is running.");
  }
};

/**
 * Submit a review for a doctor
 * @param {Object} reviewData - { patient_id, doctor_id, rating, comment }
 */
export const submitReview = async (reviewData) => {
  const response = await fetch(`${API}/patient/reviews`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(reviewData),
  });
  return handleResponse(response);
};

/**
 * Get all reviews submitted by the current patient
 */
export const getPatientReviews = async () => {
  const response = await fetch(`${API}/patient/reviews`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/**
 * Get reviews for a specific doctor
 * @param {string} doctorId - The doctor's ID
 */
export const getDoctorReviews = async (doctorId) => {
  const response = await fetch(`${API}/patient/doctors/${doctorId}/reviews`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/**
 * Delete a review (if patient is the author)
 * @param {number} reviewId - The review's ID
 */
export const deleteReview = async (reviewId) => {
  const response = await fetch(`${API}/patient/reviews/${reviewId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};
