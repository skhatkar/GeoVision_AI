import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const uploads = [
  "Roads.shp",
  "Villages.xlsx",
  "Schools.geojson",
  "Assets.csv",
];

export default function RecentUploads() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Recent Uploads
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {uploads.map((file) => (
          <div
            key={file}
            className="rounded-lg border p-3 hover:bg-muted"
          >
            {file}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}