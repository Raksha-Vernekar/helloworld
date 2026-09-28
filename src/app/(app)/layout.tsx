import { QuestProvider } from "@/components/QuestProvider";
import { AppShell } from "@/components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QuestProvider>
      <AppShell>{children}</AppShell>
    </QuestProvider>
  );
}
