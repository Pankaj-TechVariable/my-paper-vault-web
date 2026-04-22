import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuthStore } from "@/store/authStore";

const Landing = lazy(() => import("@/pages/Landing"));
const Home = lazy(() => import("@/pages/Home/Home"));
const Login = lazy(() => import("@/pages/Login"));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-64">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Requires session — redirects to /login if not authenticated
const ProtectedRoute = () => {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// Requires NO session — redirects to /home if already authenticated
const PublicOnlyRoute = () => {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <PageLoader />;
  if (session) return <Navigate to="/home" replace />;
  return <Outlet />;
};

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public only — redirect to /home if logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Private — redirect to /login if not logged in */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
