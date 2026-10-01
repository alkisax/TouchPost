import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { backendUrl } from "./constants/constants";
import Layout from "./layout/layout";
import ProtectedRoute from "./authLogin/service/ProtectedRoute";
import SkeletonGeneral from "./components/SkeletonGeneral";
import Home from "./pages/Home";

const CardViewer = lazy(() => import("./pages/CardViewer"));

const Login = lazy(() => import("./authLogin/Login"));
const RegisterPageBackend = lazy(
  () => import("./authLogin/loginBackend/RegisterPageBackend"),
);
const RegisterAdminPageBackend = lazy(
  () => import("./authLogin/loginBackend/RegisterAdminPageBackend"),
);

const Info = lazy(() => import("./pages/Info"));
const UserPage = lazy(() => import("./pages/UserPage"));
const StaffPage = lazy(() => import("./pages/StaffPage"));
const SuperAdminPage = lazy(() => import("./pages/SuperAdminPage"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/v" element={<CardViewer />} />

        <Route
          path="/info"
          element={
            <Suspense fallback={<SkeletonGeneral />}>
              <Info />
            </Suspense>
          }
        />

        <Route
          path="/login"
          element={
            <Suspense fallback={<SkeletonGeneral />}>
              <Login url={backendUrl} />
            </Suspense>
          }
        />

        <Route
          path="/register"
          element={
            <Suspense fallback={<SkeletonGeneral />}>
              <RegisterPageBackend url={backendUrl} />
            </Suspense>
          }
        />

        <Route
          path="/register-admin"
          element={
            <Suspense fallback={<SkeletonGeneral />}>
              <RegisterAdminPageBackend url={backendUrl} />
            </Suspense>
          }
        />

        <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
          <Route
            path="/superadmin"
            element={
              <Suspense fallback={<SkeletonGeneral />}>
                <SuperAdminPage />
              </Suspense>
            }
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<SkeletonGeneral />}>
                <AdminLayout />
              </Suspense>
            }
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
          <Route
            path="/staff"
            element={
              <Suspense fallback={<SkeletonGeneral />}>
                <StaffPage />
              </Suspense>
            }
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route
            path="/user"
            element={
              <Suspense fallback={<SkeletonGeneral />}>
                <UserPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
