const activity = [
  "Uploaded Village.shp",
  "Generated AI Report",
  "Dataset Updated",
  "Asset Validation Complete",
];

export default function RecentActivity() {
  return (
    <div className="rounded-3xl border border-white/10 bg-card p-8 shadow-lg">

      <h2 className="text-xl font-semibold">
        Recent Activity
      </h2>

      <div className="mt-6 space-y-4">

        {activity.map((item) => (

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