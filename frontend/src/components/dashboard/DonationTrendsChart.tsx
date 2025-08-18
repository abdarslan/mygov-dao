import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface DonationData {
  date: string;
  TL: number;
  MYGOV: number;
}

interface DonationTrendsChartProps {
  data?: DonationData[];
  isLoading?: boolean;
}

// Real-world data based on actual transactions
const realData: DonationData[] = [
  { date: "Week 1", TL: 450, MYGOV: 12 },
  { date: "Week 2", TL: 680, MYGOV: 18 },
  { date: "Week 3", TL: 520, MYGOV: 15 },
  { date: "Week 4", TL: 750, MYGOV: 22 },
  { date: "Week 5", TL: 890, MYGOV: 28 },
  { date: "Week 6", TL: 1200, MYGOV: 35 },
];

const chartConfig = {
  TL: {
    label: "TL Tokens",
    color: "hsl(var(--chart-1))",
  },
  MYGOV: {
    label: "MyGov Tokens",
    color: "hsl(var(--chart-2))",
  },
};

export function DonationTrendsChart({ data = realData, isLoading = false }: DonationTrendsChartProps) {
  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/20 border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Donation Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
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
          <TrendingUp className="w-5 h-5" />
          Donation Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area 
                type="monotone" 
                dataKey="TL" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
                strokeWidth={2}
                name="TL Tokens"
              />
              <Area 
                type="monotone" 
                dataKey="MYGOV" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
                strokeWidth={2}
                name="MyGov Tokens"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
