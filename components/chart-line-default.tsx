"use client";

import { CheckCircle2 } from "lucide-react";
import { Line, LineChart } from "recharts";

import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "AI models validation trend";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartLineDefault() {
  return (
    <Card className="w-56 gap-0 rounded-xl border-border py-4 shadow-lg">
      <div className="px-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-500" />
          <span className="text-sm font-semibold text-foreground">
            AI models
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Clinically validated
        </p>
      </div>
      <ChartContainer config={chartConfig} className="mt-3 h-8 w-full px-4">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 4, bottom: 4, left: 0, right: 0 }}
        >
          <Line
            dataKey="desktop"
            type="natural"
            stroke="var(--color-desktop)"
            strokeWidth={2.5}
            strokeLinecap="round"
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </Card>
  );
}

export default ChartLineDefault;
