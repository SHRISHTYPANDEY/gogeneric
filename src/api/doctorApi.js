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
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    throw error;
  }
};