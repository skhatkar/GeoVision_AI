import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const projects = [
  "Village Asset Inventory",
  "Forest Mapping",
  "Healthcare Accessibility",
  "Road Network Survey",
];

export default function RecentProjects() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Recent Projects
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {projects.map((project) => (
          <div
            key={project}
            className="rounded-lg border p-3 hover:bg-muted"
          >
            {project}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}