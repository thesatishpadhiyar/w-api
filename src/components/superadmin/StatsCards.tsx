import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Smartphone, MessageSquare, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalNumbers: number;
  activeNumbers: number;
  totalConversations: number;
  totalMessages: number;
  messagesToday: number;
  messagesYesterday: number;
}

interface StatsCardsProps {
  stats: Stats;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const messageChange = stats.messagesYesterday > 0 
    ? ((stats.messagesToday - stats.messagesYesterday) / stats.messagesYesterday * 100).toFixed(1)
    : 0;
  const isPositiveChange = Number(messageChange) >= 0;

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      subtitle: `${stats.activeUsers} active, ${stats.blockedUsers} blocked`
    },
    { 
      title: 'WhatsApp Numbers', 
      value: stats.totalNumbers, 
      icon: Smartphone, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      subtitle: `${stats.activeNumbers} connected`
    },
    { 
      title: 'Total Conversations', 
      value: stats.totalConversations, 
      icon: MessageSquare, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtitle: 'Across all users'
    },
    { 
      title: 'Messages Today', 
      value: stats.messagesToday, 
      icon: Activity, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      subtitle: (
        <span className={cn(
          "flex items-center gap-1",
          isPositiveChange ? "text-green-500" : "text-red-500"
        )}>
          {isPositiveChange ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositiveChange ? '+' : ''}{messageChange}% vs yesterday
        </span>
      ),
      showTrend: true
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statCards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
          <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500", card.bgColor)} />
          <CardHeader className="flex flex-row items-center justify-between pb-3 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn("p-2.5 rounded-xl shadow-sm", card.bgColor)}>
              <card.icon className={cn("h-5 w-5", card.color)} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              {loading ? <span className="text-muted-foreground">...</span> : card.value.toLocaleString()}
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
