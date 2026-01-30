import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  LayoutDashboard,
  Phone,
  MessageCircle,
  Users,
  FileText,
  Zap,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Plus,
  Building2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mobile bottom nav items
const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: MessageCircle, label: 'Chat', path: '/dashboard/chat' },
  { icon: Users, label: 'Contacts', path: '/dashboard/contacts' },
  { icon: Building2, label: 'Hotel', path: '/dashboard/automation' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

// Full sidebar nav items
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Phone, label: 'WhatsApp Numbers', path: '/dashboard/numbers' },
  { icon: MessageCircle, label: 'Live Chat', path: '/dashboard/chat' },
  { icon: Users, label: 'Contacts', path: '/dashboard/contacts' },
  { icon: FileText, label: 'Templates', path: '/dashboard/templates' },
  { icon: Building2, label: 'Automation', path: '/dashboard/automation' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { numbers, selectedNumber, selectNumber } = useWhatsApp();
  const { isSuperAdmin } = useSuperAdmin();
  const location = useLocation();

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user?.email?.[0].toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-surface-2 flex w-full">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out shadow-xl",
          sidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-5 border-b border-sidebar-border/50">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-display font-bold text-sidebar-foreground tracking-tight">
                Chat Setu
              </span>
            )}
          </Link>
        </div>

        {/* WhatsApp Number Selector */}
        {sidebarOpen && numbers.length > 0 && (
          <div className="p-5 border-b border-sidebar-border/50">
            <Select
              value={selectedNumber?.id || ''}
              onValueChange={selectNumber}
            >
              <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border/50 text-sidebar-foreground hover:bg-sidebar-accent transition-colors h-11">
                <SelectValue placeholder="Select a number" />
              </SelectTrigger>
              <SelectContent>
                {numbers.map((num) => (
                  <SelectItem key={num.id} value={num.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          num.status === 'active' ? "status-active" : "status-pending"
                        )}
                      />
                      <span>{num.display_name || num.phone_number}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "scale-110")} />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-5 border-t border-sidebar-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent/50 w-full justify-center h-11 rounded-xl transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border animate-slide-in-right">
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-display font-bold text-sidebar-foreground">
                  Chat Setu
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-muted"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto">
            {!selectedNumber && numbers.length === 0 && (
              <Button variant="hero" size="default" asChild className="shadow-md">
                <Link to="/dashboard/numbers">
                  <Plus className="h-4 w-4" />
                  Connect WhatsApp
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 h-11 px-3 hover:bg-muted rounded-xl">
                  <Avatar className="h-9 w-9 border-2 border-border shadow-sm">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium max-w-32 truncate">
                    {profile?.full_name || user?.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold text-base">{profile?.full_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isSuperAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg">
                    <Link to="/superadmin">
                      <Shield className="h-4 w-4 mr-3 text-destructive" />
                      SuperAdmin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg">
                  <Link to="/dashboard/settings">
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer p-3 rounded-lg">
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content - extra padding bottom for mobile nav */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0 bg-surface-2">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-inset-bottom shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-all rounded-lg",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
