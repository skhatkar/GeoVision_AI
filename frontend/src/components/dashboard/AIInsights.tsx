import { Brain, AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const insights = [
  {
    icon: CheckCircle2,
    color: "text-green-500",
    text: "96.8% asset classification accuracy",
  },
  {
    icon: AlertTriangle,
    color: "text-yellow-500",
    text: "24 villages require healthcare analysis",
  },
  {
    icon: Brain,
    color: "text-sky-500",
    text: "AI detected 18 duplicate assets",
  },
];

export default function AIInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {insights.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Icon className={`h-5 w-5 ${item.color}`} />

              <p className="text-sm">
                {item.text}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}