import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Calendar,
  Image,
  UserCircle,
  FolderOpen,
  Lightbulb,
  MessageSquare,
  DollarSign,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Visão Geral', icon: LayoutDashboard },
  { path: '/admin/usuarios', label: 'Usuários', icon: Users },
  { path: '/admin/campanhas', label: 'Campanhas', icon: TrendingUp },
  { path: '/admin/agenda', label: 'Agenda', icon: Calendar },
  { path: '/admin/solicitacoes', label: 'Solicitações', icon: Image },
  { path: '/admin/leads', label: 'Leads', icon: UserCircle },
  { path: '/admin/arquivos', label: 'Arquivos', icon: FolderOpen },
  { path: '/admin/insights', label: 'Insights', icon: Lightbulb },
  { path: '/admin/ideias', label: 'Ideias', icon: MessageSquare },
  { path: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-neutral-900 border-r border-neutral-800 hidden lg:block shadow-sm">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-800">
            <h1 className="text-2xl font-bold text-neutral-50">
              IMPERIO
            </h1>
            <p className="text-xs text-neutral-400 mt-1 font-medium">Marketing Hub</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white font-medium'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    <span className="text-sm">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-100 truncate">{profile?.name}</p>
                <p className="text-xs text-neutral-400 truncate">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`absolute left-0 top-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 shadow-xl transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo + Close Button */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-50">
                  IMPERIO
                </h1>
                <p className="text-xs text-neutral-400 mt-1 font-medium">Marketing Hub</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white font-medium'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                      <span className="text-sm">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-100 truncate">{profile?.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-neutral-400" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 bg-neutral-800 rounded-lg px-4 py-2 w-80">
                <Search className="w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar clientes, campanhas..."
                  className="bg-transparent border-none outline-none text-sm text-neutral-100 placeholder-neutral-500 w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-neutral-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
