import AppRouter from "./router/AppRouter";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap";
import Toaster from "./components/Toaster";

export default function App() {
  useAuthBootstrap();
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}
