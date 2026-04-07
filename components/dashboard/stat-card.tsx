export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="card dashboard-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
