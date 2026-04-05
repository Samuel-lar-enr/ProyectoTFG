import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { DashboardProvider } from './context/DashboardContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <Toaster position="top-right" richColors closeButton />
          <AppRoutes />
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
