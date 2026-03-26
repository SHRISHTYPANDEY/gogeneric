import api from "./axiosInstance";

// Fetch all doctors
export const getDoctors = async () => {
  try {
    const response = await api.get("/api/v1/doctor"); 
    return response.data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
};

// Fetch single doctor by ID
export const getDoctorById = async (id) => {
  try {
    const response = await api.get(`/api/v1/doctor/${id}`);
    console.log("Doctor data fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    throw error;
  }
};
export const getApprovedDoctors = async () => {
  try {
    const response = await api.get("/api/v1/doctor/approved/list"); 
    return response.data.data; 
  } catch (error) {
    console.error("Error fetching approved doctors:", error);
    throw error;
  }
};
export const getApprovedDoctorById = async (id) => {
  const res = await api.get(`/api/v1/doctor/approved/${id}`);
  return res.data.data;
};
export const getDoctorPlans = async (doctorId) => {
  const res = await api.get(`/api/v1/doctor/${doctorId}/plans`);
  return res.data.plans;  
};
export const bookAppointment = async (data) => {
  try {
    const res = await api.post("/api/v1/doctor/appointments", data);
    return res.data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};
export const getApprovedPlans = async (doctorId) => {
  const res = await api.get(`/api/v1/doctor/${doctorId}/approved-plans`);
  return res.data.plans;
};