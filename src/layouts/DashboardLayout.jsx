import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  UserCircle, 
  Truck, 
  Package, 
  Receipt, 
  CalendarClock, 
  HardHat,
  LogOut,
  Menu,
  X,
  Moon,
  ChevronDown,
  ChevronUp,
  Building2,
  Lock,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  FileText
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },

  { 
    name: 'Site', 
    icon: Building2,
    subItems: [
      { name: 'All Sites', path: '/sites' },
      { name: 'Add Site', path: '/add-site' },
      { name: 'Site Incharge', path: '/incharge' }]
  },
  { 
    name: 'Daily Reports', 
    icon: FileText,
    subItems: [
      { name: 'Add Report', path: '/daily-report' },
      { name: 'Reports List', path: '/daily-reports-list' }]
  },
  { name: 'Staff Salary', path: '/salary', icon: Users },
  { name: 'Accounts', path: '/accounts', icon: Wallet },
  { 
    name: 'Head Office', 
    icon: Building2,
    subItems: [
      { name: 'Income', path: '/head-office/income' },
      { name: 'Expense', path: '/head-office/expense' }]
  },
  
  
  { name: 'Supplier', path: '/suppliers', icon: Truck },
  { 
    name: 'Material', 
    icon: Package,
    subItems: [
      { name: 'Materials List', path: '/material' },
      { name: 'Material Stock', path: '/material-stock' },
      ]
  },
  { name: 'Subcontractor', path: '/subcontractor', icon: HardHat }];

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard', desc: 'Welcome back, Admin' };
    if (path === '/sites') return { title: 'All Sites', desc: 'Manage all construction sites' };
    if (path === '/add-site') return { title: 'Add Site', desc: 'Register a new construction site' };
    if (path === '/incharge') return { title: 'Site Incharge', desc: 'Manage site incharge balances and expenses' };
    if (path === '/daily-reports/list') return { title: 'Daily Reports', desc: 'View and manage all daily reports' };
    if (path === '/daily-reports/create') return { title: 'Create Report', desc: 'Create a new daily report' };
    if (path === '/staff-salary') return { title: 'Staff Salary', desc: 'Manage staff salaries and attendance' };
    if (path === '/accounts') return { title: 'Accounts', desc: 'Manage company accounts and transactions' };
    if (path === '/head-office/income') return { title: 'Head Office Income', desc: 'Manage head office income' };
    if (path === '/head-office/expense') return { title: 'Head Office Expense', desc: 'Manage head office expenses' };
    if (path === '/suppliers') return { title: 'Suppliers', desc: 'Manage supplier details' };
    if (path === '/material') return { title: 'Materials List', desc: 'Manage all materials' };
    if (path === '/material-stock') return { title: 'Material Stock', desc: 'All material IN entries from daily reports' };
    if (path === '/subcontractor') return { title: 'Subcontractor', desc: 'Manage subcontract labour and work details' };
    
    // Default fallback
    const routeName = path.split('/').pop().replace('-', ' ');
    return { 
      title: routeName.charAt(0).toUpperCase() + routeName.slice(1) || 'Dashboard', 
      desc: 'RCY Construction Management' 
    };
  };

  const pageInfo = getPageTitle();


  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Get dynamic user from local storage
  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const adminName = adminUser.name || 'Administrator';
  const adminEmail = adminUser.email || 'admin@rcy.com';
  const adminInitials = adminName.substring(0, 2).toUpperCase();

  const toggleMenu = (menuName) => {
    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
    setOpenMenus(prev => 
      prev.includes(menuName) 
        ? []
        : [menuName]
    );
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      if (token) {
        await fetch(`${apiUrl}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage regardless of API success
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token_expiry');
      localStorage.removeItem('admin_user');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white font-sans flex transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 h-screen sticky top-0 transition-all duration-300`}>
        <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-200 dark:border-gray-800 h-20`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 text-transparent bg-clip-text whitespace-nowrap truncate">RCY Construction</h2>
            </div>
          )}
          {isSidebarCollapsed && (
             <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0 cursor-pointer" onClick={() => setIsSidebarCollapsed(false)}>
               <LayoutDashboard className="w-6 h-6 text-white" />
             </div>
          )}
          {!isSidebarCollapsed && (
            <button onClick={() => setIsSidebarCollapsed(true)} className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0">
               <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            item.subItems ? (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.name)}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`w-full flex items-center p-3 rounded-xl transition-all font-medium ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} ${
                    openMenus.includes(item.name)
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800/80 dark:text-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isSidebarCollapsed && (openMenus.includes(item.name) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                </button>
                {!isSidebarCollapsed && openMenus.includes(item.name) && (
                  <div className="pl-11 pr-2 space-y-1 mt-1">
                    {item.subItems.map(sub => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-xl transition-all font-medium ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-inner dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-blue-500/5'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                          }`
                        }
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.name}
                to={item.path}
                title={isSidebarCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-xl transition-all font-medium ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-inner dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20 dark:shadow-blue-500/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            )
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Logout' : undefined}
            className={`flex items-center p-3 w-full rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-400/10 transition-colors font-medium ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header & Menu overlay */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-4 z-50 transition-colors duration-300">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1.5 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">RCY Construction</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-900/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-white border-l border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex flex-col shadow-2xl animate-in slide-in-from-right transition-colors duration-300">
            <div className="p-4 flex justify-end border-b border-gray-200 dark:border-gray-800 h-16 items-center">
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              {navItems.map((item) => (
                item.subItems ? (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${
                        openMenus.includes(item.name)
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-800/80 dark:text-gray-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </div>
                      {openMenus.includes(item.name) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {openMenus.includes(item.name) && (
                      <div className="pl-11 pr-2 space-y-1 mt-1">
                        {item.subItems.map(sub => (
                          <NavLink
                            key={sub.name}
                            to={sub.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `block px-4 py-2 text-sm rounded-xl transition-all font-medium ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50'
                              }`
                            }
                          >
                            {sub.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                )
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-400/10 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <header className="hidden md:flex h-20 items-center justify-between px-8 border-b border-gray-200 dark:border-gray-900/50 bg-white/80 dark:bg-gray-950/50 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">{pageInfo.title}</h1>
            <p className="text-sm text-gray-500">{pageInfo.desc}</p>
          </div>
          <div className="flex items-center gap-6">
            
            {/* Theme Toggle Desktop */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-full dark:text-gray-400 dark:bg-gray-800 dark:hover:text-blue-400 dark:hover:bg-gray-700 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-800 relative">
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px] cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{adminInitials}</span>
                </div>
              </div>
              <div className="hidden lg:block cursor-pointer" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{adminName}</p>
                <p className="text-xs text-gray-500">{adminEmail}</p>
              </div>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setIsPasswordModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                  >
                    <Lock className="w-4 h-4 text-gray-400" />
                    Change Password
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors border-t border-gray-100 dark:border-gray-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto" onClick={() => setProfileMenuOpen(false)}>
          <Outlet />
        </div>
      </main>
      
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      
    </div>
  );
}
