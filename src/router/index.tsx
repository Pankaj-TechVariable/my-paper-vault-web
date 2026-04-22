import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const Landing = lazy(() => import("@/pages/Landing"));
const Home = lazy(() => import("@/pages/Home/Home"));
const Login = lazy(() => import("@/pages/Login"));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-64">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Pages with Navbar + Footer */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
        </Route>

        {/* Auth pages — no Navbar/Footer */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
