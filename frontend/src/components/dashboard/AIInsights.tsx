import { Sparkles } from "lucide-react";

const insights = [
  "24 villages missing water assets",
  "12 duplicate GIS layers detected",
  "Road inventory updated today",
  "AI recommends validating 42 assets",
];

export default function AIInsights() {
  return (
    <div className="rounded-3xl border border-white/10 bg-card p-8 shadow-lg">

      <div className="flex items-center gap-3">

        <Sparkles className="text-cyan-400" />

        <h2 className="text-xl font-semibold">
          AI Insights
        </h2>

      </div>

      <div className="mt-6 space-y-4">

        {insights.map((item) => (

          <div
            key={item}
            className="rounded-xl bg-background p-4"
          >
            {item}
          </div>

        ))}

      </div>

    </div>
  );
}