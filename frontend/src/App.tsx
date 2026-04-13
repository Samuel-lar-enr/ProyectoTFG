import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { DashboardProvider } from './context/DashboardContext';
import AppRoutes from './routes/AppRoutes';
import { UIProvider } from './context/UIContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <DashboardProvider>
            <Toaster position="top-right" richColors closeButton />
            <AppRoutes />
          </DashboardProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
