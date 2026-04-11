export function StageCard({
  stage,
  title,
  items
}: {
  stage: string;
  title: string;
  items: readonly string[];
}) {
  return (
    <article className="card stageCard">
      <p className="eyebrow">{stage}</p>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
