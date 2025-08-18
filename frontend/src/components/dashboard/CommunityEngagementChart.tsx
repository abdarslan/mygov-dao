import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface EngagementData {
  name: string;
  value: number;
  color: string;
}

interface CommunityEngagementChartProps {
  data?: EngagementData[];
  isLoading?: boolean;
}

const mockData: EngagementData[] = [
  { name: "Active Voters", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Project Creators", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Donors", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Passive Members", value: 10, color: "hsl(var(--chart-4))" },
];

const chartConfig = {
  "Active Voters": {
    label: "Active Voters",
    color: "hsl(var(--chart-1))",
  },
  "Project Creators": {
    label: "Project Creators", 
    color: "hsl(var(--chart-2))",
  },
  "Donors": {
    label: "Donors",
    color: "hsl(var(--chart-3))",
  },
  "Passive Members": {
    label: "Passive Members",
    color: "hsl(var(--chart-4))",
  },
};

export function CommunityEngagementChart({ data = mockData, isLoading = false }: CommunityEngagementChartProps) {
  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/20 border-white/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Community Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Statistics below the chart */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.name}</span>
              </div>
              <span className="font-medium text-gray-800">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
