import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Account from './pages/Account';
import Salary from './pages/Salary';
import Supplier from './pages/Supplier';
import Material from './pages/Material';
import ExpensesHead from './pages/ExpensesHead';
import MaterialIn from './pages/MaterialIn';
import MaterialOut from './pages/MaterialOut';
import Subcontractor from './pages/Subcontractor';
import SiteIncharge from './pages/SiteIncharge';
import HeadOfficeIncome from './pages/HeadOfficeIncome';
import HeadOfficeExpense from './pages/HeadOfficeExpense';
import ComingSoon from './pages/ComingSoon';
import Sites from './pages/Sites';
import AddSite from './pages/AddSite';
import DailyReport from './pages/DailyReport';
import DailyReportsList from './pages/DailyReportsList';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfirmProvider } from './components/ConfirmProvider';
import { Toaster, toast } from 'react-hot-toast';

if (!window.__fetchIntercepted) {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
    const isMutation = options && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase());
    
    try {
      const response = await originalFetch(...args);
      if (isMutation) {
        if (response.ok) {
           if (url.toString().includes('/login')) {
               toast.success('Login successful!');
           } else if (options.method === 'DELETE') {
               toast.success('Deleted successfully!');
           } else {
               toast.success('Saved successfully!');
           }
        } else {
           toast.error('Operation failed!');
        }
      }
      return response;
    } catch (error) {
      if (isMutation) toast.error('Network error!');
      throw error;
    }
  };
  window.__fetchIntercepted = true;
}

function App() {
  return (
    <ThemeProvider>
      <ConfirmProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
                                          <Route path="salary" element={<Salary />} />
              <Route path="accounts" element={<Account />} />
              <Route path="suppliers" element={<Supplier />} />
              <Route path="material" element={<Material />} />
              <Route path="expenses" element={<ExpensesHead />} />
              <Route path="material-in" element={<MaterialIn />} />
              <Route path="material-out" element={<MaterialOut />} />
              
              {/* Head Office Routes */}
              <Route path="head-office/income" element={<HeadOfficeIncome />} />
              <Route path="head-office/expense" element={<HeadOfficeExpense />} />
              
              {/* Coming Soon Routes */}
              <Route path="incharge" element={<SiteIncharge />} />
              <Route path="sites" element={<Sites />} />
              <Route path="add-site" element={<AddSite />} />
              <Route path="daily-report" element={<DailyReport />} />
              <Route path="daily-reports-list" element={<DailyReportsList />} />
              <Route path="subcontractor" element={<Subcontractor />} />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ConfirmProvider>
    </ThemeProvider>
  );
}

export default App;
