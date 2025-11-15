// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import api from "./api/axios";
import useAuthStore from "./store/authStore";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
// import Navbar from "./components/Layout/Navbar";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Auth/Login";

// lazy load pages
const CoursesList = lazy(() => import("./features/student/CoursesList"));
const RegisterCourse = lazy(() => import("./features/student/RegisterCourse"));
const CreateDepartment = lazy(() =>
  import("./features/admin/CreateDepartment")
);
const Profile = lazy(() => import("./components/Profile/Profile")); // <-- add this
const CreateUser = lazy(() => import("./features/admin/CreateUser"));
const CreateCourse = lazy(() => import("./features/admin/CreateCourse"));
const UploadResults = lazy(() => import("./features/lecturer/UploadResults"));

export default function App() {
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get("/auth/me"); // server should return { user }
        if (resp?.data?.user) {
          // token is cookie-based so pass null
          login(null, resp.data.user);
        }
      } catch (err) {
        console.log(
          "No active session / couldn't restore user:",
          err?.response?.status
        );
      }
    })();
  }, [login]);

  return (
    <BrowserRouter>
      {/* primary header with user info */}
      <Header />
      {/* optional secondary nav */}
      {/* <Navbar /> */}

      <div className="max-w-6xl mx-auto p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CoursesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register/:id"
              element={
                <ProtectedRoute roles={["student"]}>
                  <RegisterCourse />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/create-department"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <CreateDepartment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-user"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <CreateUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-course"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <CreateCourse />
                </ProtectedRoute>
              }
            />

            <Route
              path="/lecturer/upload-results"
              element={
                <ProtectedRoute roles={["lecturer", "admin"]}>
                  <UploadResults />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
