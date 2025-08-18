import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Coins, Users, Gift, Target, Calendar } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  description 
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="w-3 h-3" />;
      case "negative":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {change && (
          <p className={`text-xs ${getChangeColor()} flex items-center gap-1 mt-1`}>
            {getChangeIcon()}
            {change}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-configured stat cards for common metrics
export function TLBalanceCard({ balance, change }: { balance: string; change?: string }) {
  return (
    <StatsCard
      title="DAO TL Balance"
      value={`${balance} TL`}
      change={change}
      changeType={change && change.startsWith('+') ? "positive" : "negative"}
      icon={DollarSign}
      description="Total TL tokens in DAO treasury"
    />
  );
}

export function TotalDonationsCard({ amount, change }: { amount: string; change?: string }) {
  return (
    <StatsCard
      title="Total Donations"
      value={`${amount} TL`}
      change={change}
      changeType="positive"
      icon={Gift}
      description="Total TL tokens donated to the DAO"
    />
  );
}

export function ReservedTokensCard({ amount, change }: { amount: string; change?: string }) {
  return (
    <StatsCard
      title="Reserved by Projects"
      value={`${amount} TL`}
      change={change}
      changeType="neutral"
      icon={Target}
      description="TL tokens allocated to active projects"
    />
  );
}

export function ProjectCountCard({ count, change }: { count: number; change?: string }) {
  return (
    <StatsCard
      title="Total Projects"
      value={count}
      change={change}
      changeType="positive"
      icon={Users}
      description="All projects submitted to the DAO"
    />
  );
}

export function ActiveProjectsCard({ count, change }: { count: number; change?: string }) {
  return (
    <StatsCard
      title="Active Projects"
      value={count}
      change={change}
      changeType="positive"
      icon={Calendar}
      description="Currently funded and active projects"
    />
  );
}

export function MyGovSupplyCard({ supply, change }: { supply: string; change?: string }) {
  return (
    <StatsCard
      title="MyGov Token Supply"
      value={supply}
      change={change}
      changeType="neutral"
      icon={Coins}
      description="Total MyGov tokens in circulation"
    />
  );
}
