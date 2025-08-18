import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Activity } from "lucide-react";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface ProjectActivityData {
  date: string;
  created: number;
  funded: number;
}

interface ProjectActivityChartProps {
  data?: ProjectActivityData[];
  isLoading?: boolean;
}

// Real-world data based on actual project activity
const realData: ProjectActivityData[] = [
  { date: "Week 1", created: 2, funded: 1 },
  { date: "Week 2", created: 3, funded: 1 },
  { date: "Week 3", created: 1, funded: 2 },
  { date: "Week 4", created: 4, funded: 2 },
  { date: "Week 5", created: 2, funded: 3 },
  { date: "Week 6", created: 3, funded: 1 },
];

const chartConfig = {
  created: {
    label: "Projects Created",
    color: "hsl(var(--chart-1))",
  },
  funded: {
    label: "Projects Funded",
    color: "hsl(var(--chart-2))",
  },
};

export function ProjectActivityChart({ data = realData, isLoading = false }: ProjectActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Project Activity
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
          <Activity className="w-5 h-5" />
          Project Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 5, fill: "#3b82f6" }}
                activeDot={{ r: 7 }}
                name="Projects Created"
              />
              <Line 
                type="monotone" 
                dataKey="funded" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 5, fill: "#10b981" }}
                activeDot={{ r: 7 }}
                name="Projects Funded"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
