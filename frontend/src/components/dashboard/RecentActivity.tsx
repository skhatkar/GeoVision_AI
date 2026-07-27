import {
  Activity,
  Upload,
  Database,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const activities = [
  {
    icon: Upload,
    text: "Road Network uploaded",
    time: "5 min ago",
  },
  {
    icon: Database,
    text: "Assets synchronized",
    time: "18 min ago",
  },
  {
    icon: Activity,
    text: "AI analysis completed",
    time: "1 hour ago",
  },
];

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {activities.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-sky-500" />

                <span>{item.text}</span>
              </div>

              <span className="text-sm text-muted-foreground">
                {item.time}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}