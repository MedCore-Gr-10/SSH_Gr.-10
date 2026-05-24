const API = "http://localhost:3000/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: localStorage.getItem("token")
    ? `Bearer ${localStorage.getItem("token")}`
    : "",
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data.data;
};

export const getDoctorDashboard = async () => {
  const res = await fetch(`${API}/doctor/dashboard`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(res);
};