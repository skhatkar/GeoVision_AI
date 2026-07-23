import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Props {
  children: React.ReactNode;
}

export default function AppShell({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-72">
        <Topbar />

        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  );
}