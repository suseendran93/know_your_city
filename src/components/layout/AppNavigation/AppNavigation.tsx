"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./AppNavigation.module.scss";

type AppNavigationProps = {
  homeLabel: string;
  backLabel: string;
  ariaLabel: string;
};

export function AppNavigation({ homeLabel, backLabel, ariaLabel }: AppNavigationProps) {
  const router = useRouter();

  return (
    <nav aria-label={ariaLabel} className={styles.navigation}>
      <button type="button" className={`${styles.backButton} type-button`} onClick={() => router.back()}>
        {backLabel}
      </button>
      <Link href="/" className={`${styles.homeLink} type-button`}>
        {homeLabel}
      </Link>
    </nav>
  );
}
