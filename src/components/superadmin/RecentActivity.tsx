import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, UserPlus, Phone, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'message' | 'user' | 'number';
  title: string;
  subtitle: string;
  timestamp: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      // Fetch recent messages
      const { data: messages } = await supabase
        .from('messages')
        .select('id, created_at, direction, content')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, created_at, email, full_name')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent WhatsApp numbers
      const { data: numbers } = await supabase
        .from('whatsapp_numbers')
        .select('id, created_at, phone_number, display_name')
        .order('created_at', { ascending: false })
        .limit(5);

      const allActivities: Activity[] = [
        ...(messages || []).map(m => ({
          id: `msg-${m.id}`,
          type: 'message' as const,
          title: m.direction === 'inbound' ? 'New message received' : 'Message sent',
          subtitle: m.content?.substring(0, 50) || 'Media message',
          timestamp: m.created_at,
        })),
        ...(users || []).map(u => ({
          id: `user-${u.id}`,
          type: 'user' as const,
          title: 'New user registered',
          subtitle: u.full_name || u.email,
          timestamp: u.created_at,
        })),
        ...(numbers || []).map(n => ({
          id: `num-${n.id}`,
          type: 'number' as const,
          title: 'WhatsApp number connected',
          subtitle: n.display_name || n.phone_number,
          timestamp: n.created_at,
        })),
      ];

      // Sort by timestamp
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('[Activity] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'number':
        return <Phone className="h-4 w-4 text-purple-500" />;
    }
  };

  const getTypeBadge = (type: Activity['type']) => {
    switch (type) {
      case 'message':
        return <Badge variant="secondary" className="text-xs">Message</Badge>;
      case 'user':
        return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">User</Badge>;
      case 'number':
        return <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600">Number</Badge>;
    }
  };

  return (
    <Card className="border-border hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-display font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[480px] pr-4">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 group border border-transparent hover:border-border">
                  <div className="p-2.5 rounded-xl bg-muted/80 group-hover:bg-muted transition-colors">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-medium text-sm text-foreground">{activity.title}</span>
                      {getTypeBadge(activity.type)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {activity.subtitle}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground/80">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No recent activity</p>
                  <p className="text-xs text-muted-foreground">Activity will appear here as users interact with the platform</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
