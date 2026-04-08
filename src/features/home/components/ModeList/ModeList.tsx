import styles from "./ModeList.module.scss";

type ModeListProps = {
  content: {
    kicker: string;
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
      status: string;
    }>;
  };
};

export function ModeList({ content }: ModeListProps) {
  return (
    <section id="game-modes" className={styles.section}>
      <div className={styles.header}>
        <p className={`type-label ${styles.kicker}`}>{content.kicker}</p>
        <h2 className={`type-heading-lg ${styles.title}`}>{content.title}</h2>
        <p className={`type-body-md ${styles.subtitle}`}>
          {content.subtitle}
        </p>
      </div>

      <div className={styles.grid}>
        {content.items.map((mode) => (
          <article key={mode.title} className={styles.card}>
            <p className={`type-label ${styles.status}`}>{mode.status}</p>
            <h3 className={`type-heading-md ${styles.cardTitle}`}>{mode.title}</h3>
            <p className={`type-body-sm ${styles.cardDescription}`}>{mode.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
