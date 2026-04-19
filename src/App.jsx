import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./hooks/AuthProvider";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <AuthProvider>
        <Toaster position="top-right" />

        <AppRoutes />
      </AuthProvider>
    </>
  );
}

export default App;
