import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";

interface SummaryStatsProps {
  totalMembers?: number;
  totalDonations?: number;
  activeProjects?: number;
  weeklyGrowth?: number;
  isLoading?: boolean;
}

export function SummaryStats({ 
  totalMembers = 35, 
  totalDonations = 1650, 
  activeProjects = 8, 
  weeklyGrowth = 12.5,
  isLoading = false 
}: SummaryStatsProps) {
  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          DAO Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">Total Members</span>
          </div>
          <span className="font-semibold text-gray-900">{totalMembers}</span>
        </div>

        {/* Total Donations */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">Total Donations</span>
          </div>
          <span className="font-semibold text-gray-900">{totalDonations.toLocaleString()}</span>
        </div>

        {/* Active Projects */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-700">Active Projects</span>
          </div>
          <span className="font-semibold text-gray-900">{activeProjects}</span>
        </div>

        {/* Weekly Growth */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-700">Weekly Growth</span>
          </div>
          <span className="font-semibold text-green-600">+{weeklyGrowth}%</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          <div className="text-xs text-gray-500 text-center">
            Data from last 6 weeks
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
