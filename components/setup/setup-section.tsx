import type { ReactNode } from "react";

type SetupSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  id?: string;
};

export function SetupSection({
  title,
  description,
  children,
  id,
}: SetupSectionProps) {
  return (
    <section id={id} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-propnex-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
