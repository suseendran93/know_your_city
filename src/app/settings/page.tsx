"use client";

import { AppNavigation } from "@/components/layout/AppNavigation/AppNavigation";
import { RequireAuth } from "@/components/layout/RequireAuth/RequireAuth";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import { getMessages } from "@/lib/i18n";
import type { SupportedCity } from "@/types/app";
import styles from "./page.module.scss";

export default function SettingsPage() {
  const messages = getMessages();
  const { city, setCity, logout } = useAppContext();

  return (
    <RequireAuth>
      <main className={styles.page}>
        <div className={styles.navWrap}>
          <AppNavigation
            homeLabel={messages.common.actions.home}
            backLabel={messages.common.actions.back}
            ariaLabel={messages.settings.navigationLabel}
          />
        </div>
        <section className={styles.card}>
          <p className={`type-label ${styles.kicker}`}>{messages.settings.kicker}</p>
          <h1 className={`type-heading-lg ${styles.title}`}>{messages.settings.title}</h1>
          <p className={`type-body-md ${styles.subtitle}`}>{messages.settings.subtitle}</p>

          <label className={`type-label ${styles.label}`} htmlFor="settings-city">
            {messages.settings.cityLabel}
          </label>
          <select
            id="settings-city"
            className={`type-body-md ${styles.select}`}
            value={city ?? ""}
            onChange={(event) => setCity(event.target.value as SupportedCity)}
          >
            <option value="Chennai">{messages.common.cities.chennai}</option>
            <option value="Bangalore">{messages.common.cities.bangalore}</option>
          </select>

          <button type="button" className={`${styles.logoutButton} type-button`} onClick={logout}>
            {messages.settings.logoutAction}
          </button>
        </section>
      </main>
    </RequireAuth>
  );
}
