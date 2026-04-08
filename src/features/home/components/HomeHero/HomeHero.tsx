import Link from "next/link";
import styles from "./HomeHero.module.scss";

type HomeHeroProps = {
  content: {
    badge: string;
    title: string;
    description: string;
    panelLabel: string;
    panelTitle: string;
    panelItems: string[];
  };
  actions: {
    startPlaying: string;
    viewModes: string;
  };
};

export function HomeHero({ content, actions }: HomeHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={`${styles.badge} type-label`}>{content.badge}</div>
      <h1 className={`type-display-md ${styles.title}`}>{content.title}</h1>
      <p className={`type-body-md ${styles.description}`}>
        {content.description}
      </p>
      <div className={styles.actions}>
        <Link href="/direction-mode" className={`${styles.primaryAction} type-button`}>
          {actions.startPlaying}
        </Link>
        <Link href="/#game-modes" className={`${styles.secondaryAction} type-button`}>
          {actions.viewModes}
        </Link>
      </div>
      <div className={styles.panel}>
        <p className={`type-label ${styles.panelLabel}`}>{content.panelLabel}</p>
        <p className={`type-heading-md ${styles.panelTitle}`}>{content.panelTitle}</p>
        <ul className={styles.panelList}>
          {content.panelItems.map((item) => (
            <li key={item} className="type-body-sm">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
