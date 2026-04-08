"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/layout/RequireAuth/RequireAuth";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import { HomeHero } from "@/features/home/components/HomeHero/HomeHero";
import { ModeList } from "@/features/home/components/ModeList/ModeList";
import { getMessages, interpolate } from "@/lib/i18n";
import styles from "./page.module.scss";

export default function HomePage() {
  const messages = getMessages();
  const { city, user } = useAppContext();
  const cityName = city ?? messages.common.cities.chennai;
  const welcomeName = user?.name?.trim() || "Player";
  const heroContent = {
    ...messages.home.hero,
    badge: interpolate(messages.home.hero.badge, { city: cityName }),
    title: interpolate(messages.home.hero.title, { city: cityName }),
    description: interpolate(messages.home.hero.description, { city: cityName })
  };
  const modeContent = {
    ...messages.home.modes,
    subtitle: interpolate(messages.home.modes.subtitle, { city: cityName }),
    items: messages.home.modes.items.map((item) => ({
      ...item,
      description: interpolate(item.description, { city: cityName })
    }))
  };

  return (
    <RequireAuth>
      <main>
        <div className={styles.topRow}>
          <div className={styles.infoGroup}>
            <p className={`type-body-sm ${styles.userPill}`}>
              {interpolate(messages.common.labels.welcomeUser, { name: welcomeName })}
            </p>
            <p className={`type-body-sm ${styles.cityPill}`}>
              {messages.common.labels.activeCity}: {cityName}
            </p>
          </div>
          <Link href="/settings" className={`${styles.settingsLink} type-button`}>
            {messages.common.actions.settings}
          </Link>
        </div>
        <HomeHero content={heroContent} actions={messages.common.actions} />
        <ModeList content={modeContent} />
      </main>
    </RequireAuth>
  );
}
