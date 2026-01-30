import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Smartphone, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Home,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/superadmin', icon: BarChart3, label: 'Dashboard', exact: true },
  { path: '/superadmin/users', icon: Users, label: 'Users' },
  { path: '/superadmin/whatsapp', icon: Smartphone, label: 'WhatsApp Accounts' },
  { path: '/superadmin/conversations', icon: MessageSquare, label: 'All Conversations' },
  { path: '/superadmin/settings', icon: Settings, label: 'Settings' },
];

export function SuperAdminLayout() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-surface-2">
      {/* Sidebar */}
      <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col shadow-2xl">
        <div className="p-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <span className="font-display font-bold text-xl text-sidebar-foreground">SuperAdmin</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 font-medium truncate">{profile?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive(item.path, item.exact)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive(item.path, item.exact) && "scale-110")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-5 border-t border-sidebar-border/50 space-y-3">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl border-sidebar-border/50 hover:bg-sidebar-accent/50 text-sidebar-foreground">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-11 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-surface-2">
        <Outlet />
      </main>
    </div>
  );
}
