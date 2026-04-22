import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppRouter from "./router";
import FullscreenToast from "@/components/common/FullscreenToast/FullscreenToast";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function App() {
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="top-right" expand richColors closeButton />
      <FullscreenToast />
    </QueryClientProvider>
  );
}

export default App;
