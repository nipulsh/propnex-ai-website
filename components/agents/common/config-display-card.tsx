type ConfigDisplayCardProps = {
  title: string;
  items: { label: string; value: string }[];
};

export function ConfigDisplayCard({ title, items }: ConfigDisplayCardProps) {
  return (
    <div className="rounded-xl border border-propnex-border bg-propnex-panel p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-[0.65rem] font-medium tracking-[0.12em] text-propnex-muted uppercase">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
