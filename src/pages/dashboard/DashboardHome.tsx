import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Users,
  FileText,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  Phone,
  Loader2,
} from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  messagesToday: number;
  totalContacts: number;
  activeTemplates: number;
  activeAutomations: number;
}

export default function DashboardHome() {
  const { profile, user } = useAuth();
  const { selectedNumber, numbers } = useWhatsApp();
  const [stats, setStats] = useState<DashboardStats>({
    messagesToday: 0,
    totalContacts: 0,
    activeTemplates: 0,
    activeAutomations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch dashboard stats
  useEffect(() => {
    if (!selectedNumber || !user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      // Fetch all stats in parallel
      const [messagesResult, contactsResult, templatesResult, automationsResult, recentMessagesResult] = await Promise.all([
        // Messages today
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('whatsapp_number_id', selectedNumber.id)
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd),
        // Total contacts
        supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('whatsapp_number_id', selectedNumber.id),
        // Active templates (approved)
        supabase
          .from('templates')
          .select('id', { count: 'exact', head: true })
          .eq('whatsapp_number_id', selectedNumber.id)
          .eq('status', 'APPROVED'),
        // Active automations
        supabase
          .from('automations')
          .select('id', { count: 'exact', head: true })
          .eq('whatsapp_number_id', selectedNumber.id)
          .eq('is_active', true),
        // Recent messages for activity
        supabase
          .from('messages')
          .select('id, content, direction, created_at, type')
          .eq('whatsapp_number_id', selectedNumber.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        messagesToday: messagesResult.count || 0,
        totalContacts: contactsResult.count || 0,
        activeTemplates: templatesResult.count || 0,
        activeAutomations: automationsResult.count || 0,
      });

      if (recentMessagesResult.data) {
        setRecentActivity(recentMessagesResult.data);
      }

      setLoading(false);
    };

    fetchStats();

    // Subscribe to real-time updates for messages
    const channel = supabase
      .channel('dashboard-stats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `whatsapp_number_id=eq.${selectedNumber.id}`,
        },
        () => {
          // Refetch stats when new message arrives
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedNumber, user]);

  const statsData = [
    {
      icon: MessageCircle,
      label: 'Messages Today',
      value: stats.messagesToday.toString(),
      change: 'Today',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Users,
      label: 'Total Contacts',
      value: stats.totalContacts.toString(),
      change: 'All time',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: FileText,
      label: 'Templates',
      value: stats.activeTemplates.toString(),
      change: 'Approved',
      color: 'text-status-active',
      bgColor: 'bg-status-active/10',
    },
    {
      icon: Zap,
      label: 'Automations',
      value: stats.activeAutomations.toString(),
      change: 'Active',
      color: 'text-status-pending',
      bgColor: 'bg-status-pending/10',
    },
  ];

  const quickActions = [
    {
      icon: MessageCircle,
      label: 'Open Live Chat',
      description: 'View and respond to messages',
      href: '/dashboard/chat',
    },
    {
      icon: Users,
      label: 'Manage Contacts',
      description: 'Add or import contacts',
      href: '/dashboard/contacts',
    },
    {
      icon: Zap,
      label: 'Create Automation',
      description: 'Set up auto-responses',
      href: '/dashboard/automation',
    },
    {
      icon: FileText,
      label: 'Sync Templates',
      description: 'Fetch templates from Meta',
      href: '/dashboard/templates',
    },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 max-w-[1600px] mx-auto pb-20 md:pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Here's what's happening with your WhatsApp business today
          </p>
        </div>
        
        {!selectedNumber && numbers.length === 0 && (
          <Button variant="hero" size="lg" asChild className="shadow-lg">
            <Link to="/dashboard/numbers">
              <Phone className="h-4 w-4" />
              Connect WhatsApp Number
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsData.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl ${stat.bgColor} ${stat.color} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground tracking-tight">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">Quick Actions</h2>
            <div className="h-1 flex-1 ml-4 bg-gradient-to-r from-border to-transparent rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="group relative bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h3 className="font-semibold text-base text-foreground mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-display font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedNumber ? (
              recentActivity.length > 0 ? (
                <div className="space-y-4 flex-1">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.direction === 'inbound' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.type === 'text' 
                            ? (activity.content?.substring(0, 50) + (activity.content?.length > 50 ? '...' : ''))
                            : `[${activity.type}]`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.direction === 'inbound' ? 'Received' : 'Sent'} • {format(new Date(activity.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link to="/dashboard/chat" className="block text-center text-sm font-medium text-primary hover:text-primary/80 hover:underline pt-2 transition-colors">
                    View all messages →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center flex-1">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No recent activity</p>
                  <p className="text-xs text-muted-foreground">Your latest messages will appear here</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-center flex-1">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No WhatsApp number connected</p>
                <p className="text-xs text-muted-foreground mb-4">Connect a number to start messaging</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/numbers">Connect Now</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
