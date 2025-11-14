import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Login from "./components/Auth/Login";

// lazy load pages
const CoursesList = lazy(() => import("./features/student/CoursesList"));
const RegisterCourse = lazy(() => import("./features/student/RegisterCourse"));
const CreateDepartment = lazy(() =>
  import("./features/admin/CreateDepartment")
);
const CreateUser = lazy(() => import("./features/admin/CreateUser"));
const CreateCourse = lazy(() => import("./features/admin/CreateCourse"));
const UploadResults = lazy(() => import("./features/lecturer/UploadResults"));

export default function App() {
  return (
    <BrowserRouter>
      <Header />
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
