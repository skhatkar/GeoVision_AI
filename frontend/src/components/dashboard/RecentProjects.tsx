const projects = [
  "Health Infrastructure Mapping",
  "Forest Asset Survey",
  "Village Inventory",
  "Road Network Analysis",
];

export default function RecentProjects() {
  return (
    <div className="rounded-3xl border border-white/10 bg-card p-8 shadow-lg">

      <h2 className="text-xl font-semibold">
        Recent Projects
      </h2>

      <div className="mt-6 space-y-4">

        {projects.map((project) => (

          <div
            key={project}
            className="rounded-xl bg-background p-4"
          >
            {project}
          </div>

        ))}

      </div>

    </div>
  );
}