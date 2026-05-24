const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const readResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  }

  return payload.data ?? payload;
};

export const sendPatientAiMessage = async ({ message, history }) => {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ message, history }),
  });

  return readResponse(response);
};
