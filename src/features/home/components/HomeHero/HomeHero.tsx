import Link from "next/link";
import styles from "./HomeHero.module.scss";

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.badge} type-label`}>Know Your Chennai</div>
      <h1 className={`type-display-md ${styles.title}`}>Learn Chennai like a local.</h1>
      <p className={`type-body-md ${styles.description}`}>
        A simple mobile-first game to practice directions, neighborhoods, and city memory without
        making the interface feel heavy.
      </p>
      <div className={styles.actions}>
        <Link href="/direction-mode" className={`${styles.primaryAction} type-button`}>
          Start Playing
        </Link>
        <Link href="/#game-modes" className={`${styles.secondaryAction} type-button`}>
          View Modes
        </Link>
      </div>
      <div className={styles.panel}>
        <p className={`type-label ${styles.panelLabel}`}>Today&apos;s focus</p>
        <p className={`type-heading-md ${styles.panelTitle}`}>3 quick ways to learn the city</p>
        <ul className={styles.panelList}>
          <li className="type-body-sm">Guess directions between real Chennai areas</li>
          <li className="type-body-sm">Tap the right place on the map</li>
          <li className="type-body-sm">Build a daily streak in small sessions</li>
        </ul>
      </div>
    </section>
  );
}
