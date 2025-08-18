import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Award, Clock } from "lucide-react";

interface PerformanceMetric {
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  description: string;
}

interface DAOPerformanceProps {
  metrics?: PerformanceMetric[];
  isLoading?: boolean;
}

const mockMetrics: PerformanceMetric[] = [
  {
    title: "Project Success Rate",
    value: 78,
    target: 80,
    unit: "%",
    trend: "up",
    description: "Projects that received full funding"
  },
  {
    title: "Community Participation",
    value: 65,
    target: 70,
    unit: "%",
    trend: "up",
    description: "Members active in voting"
  },
  {
    title: "Average Funding Time",
    value: 14,
    target: 21,
    unit: "days",
    trend: "down",
    description: "Time to complete project funding"
  },
  {
    title: "Treasury Growth",
    value: 125,
    target: 100,
    unit: "%",
    trend: "up",
    description: "Growth compared to last quarter"
  }
];

export function DAOPerformance({ metrics = mockMetrics, isLoading = false }: DAOPerformanceProps) {
  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            DAO Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getBadgeColor = (value: number, target: number, trend: "up" | "down" | "stable") => {
    if (trend === "down") {
      // For metrics where lower is better (like funding time)
      return value <= target ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
    }
    return value >= target ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          DAO Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric, index) => {
          const percentage = metric.title === "Average Funding Time" 
            ? Math.max(0, 100 - (metric.value / metric.target) * 100)
            : (metric.value / metric.target) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{metric.title}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getTrendColor(metric.trend)}`}>
                    {metric.value}{metric.unit}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(metric.value, metric.target, metric.trend)}`}>
                    Target: {metric.target}{metric.unit}
                  </span>
                </div>
              </div>
              
              {/* Simple progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-600">{metric.description}</p>
            </div>
          );
        })}
        
        {/* Performance Summary */}
        <div className="mt-6 pt-4 border-t border-white/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Overall Performance</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Meeting targets</span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              {metrics.filter(m => 
                m.title === "Average Funding Time" 
                  ? m.value <= m.target 
                  : m.value >= m.target
              ).length} / {metrics.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
