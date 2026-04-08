import Link from "next/link";
import styles from "./ModeList.module.scss";

type ModeListProps = {
  content: {
    kicker: string;
    title: string;
    subtitle: string;
    cta: {
      openMode: string;
    };
    items: Array<{
      title: string;
      description: string;
      path?: string;
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
            <h3 className={`type-heading-md ${styles.cardTitle}`}>{mode.title}</h3>
            <p className={`type-body-sm ${styles.cardDescription}`}>{mode.description}</p>
            {mode.path ? (
              <Link href={mode.path} className={`${styles.modeLink} type-button`}>
                {content.cta.openMode}
              </Link>
            ) : (
              <span className={styles.noAction} />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
