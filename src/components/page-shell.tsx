import { Topbar } from "./topbar";

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div className="flex flex-col">
      <Topbar title={title} subtitle={subtitle} />
      <div className="px-6 pb-8">
        {actions && <div className="mb-4 flex justify-end">{actions}</div>}
        {children}
      </div>
    </div>
  );
}
