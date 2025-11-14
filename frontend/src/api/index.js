import api from "./axios";

export const authAPI = {
  login: (body) => api.post("/auth/login", body), // withCredentials is automatic via api
  refresh: () => api.post("/auth/refresh"), // if you use refresh endpoint
};

export const departmentsAPI = {
  list: () => api.get("/departments"),
  create: (body) => api.post("/admin/createDepartment", body),
};

export const usersAPI = {
  create: (body) => api.post("/admin/users", body),
};

export const coursesAPI = {
  list: (params) => api.get("/courses", { params }),
  create: (body) => api.post("/admin/courses", body),
};

export const resultsAPI = {
  upload: (formData) =>
    api.post("/results/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const registrationsAPI = {
  create: (body) => api.post("/registrations", body),
  myRegistrations: (sessionId) => api.get(`/registrations/me/${sessionId}`),
};

export const sessionsAPI = {
  active: () => api.get("/sessions/active"), // create route server side
};
