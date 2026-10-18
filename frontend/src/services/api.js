import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lungsense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Authentication
api.register = async (data) => {
  const response = await api.post("/api/auth/register", data);
  return response.data;
};

api.login = async (data) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

api.me = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

// Dashboard
api.getDashboard = async () => {
  const response = await api.get("/api/dashboard");
  return response.data;
};

// Patients
api.getPatients = async () => {
  const response = await api.get("/api/patients");
  return response.data;
};

api.getPatient = async (patientId) => {
  const response = await api.get(`/api/patients/${patientId}`);
  return response.data;
};

api.createPatient = async (data) => {
  const response = await api.post("/api/patients", data);
  return response.data;
};

api.updatePatient = async (patientId, data) => {
  const response = await api.put(`/api/patients/${patientId}`, data);
  return response.data;
};

api.deletePatient = async (patientId) => {
  const response = await api.delete(`/api/patients/${patientId}`);
  return response.data;
};

// X-rays
api.getPatientXrays = async (patientId) => {
  const response = await api.get(`/api/patients/${patientId}/xrays`);
  return response.data;
};

api.uploadXray = async (patientId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/patients/${patientId}/xrays`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default api;
