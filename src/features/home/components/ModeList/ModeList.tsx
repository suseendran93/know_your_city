import type { HomeMode } from "@/types/home";
import styles from "./ModeList.module.scss";

type ModeListProps = {
  modes: HomeMode[];
};

export function ModeList({ modes }: ModeListProps) {
  return (
    <section id="game-modes" className={styles.section}>
      <div className={styles.header}>
        <p className={`type-label ${styles.kicker}`}>Game modes</p>
        <h2 className={`type-heading-lg ${styles.title}`}>Start simple. Learn steadily.</h2>
        <p className={`type-body-md ${styles.subtitle}`}>
          The first version focuses on short sessions, clear questions, and touch-friendly actions.
        </p>
      </div>

      <div className={styles.grid}>
        {modes.map((mode) => (
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
