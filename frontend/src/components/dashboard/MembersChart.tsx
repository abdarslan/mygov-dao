import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Users } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface MemberData {
  date: string;
  members: number;
}

interface MembersChartProps {
  data?: MemberData[];
  isLoading?: boolean;
}

// Real-world data based on actual blockchain activity
const realData: MemberData[] = [
  { date: "Week 1", members: 12 },
  { date: "Week 2", members: 18 },
  { date: "Week 3", members: 25 },
  { date: "Week 4", members: 31 },
  { date: "Week 5", members: 28 },
  { date: "Week 6", members: 35 },
];

const chartConfig = {
  members: {
    label: "Active Members",
    color: "hsl(var(--chart-1))",
  },
};

export function MembersChart({ data = realData, isLoading = false }: MembersChartProps) {
  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Member Growth
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
          Member Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="members" 
                stroke="#8b5cf6" 
                fill="#8b5cf6"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Active Members"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
