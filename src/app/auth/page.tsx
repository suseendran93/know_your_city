"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import { getMessages } from "@/lib/i18n";
import styles from "./page.module.scss";

export default function AuthPage() {
  const router = useRouter();
  const messages = getMessages();
  const { hydrated, user, login, signup } = useAppContext();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim() || "Player";

    if (!trimmedEmail) {
      return;
    }

    if (mode === "login") {
      login({ name: trimmedName, email: trimmedEmail });
    } else {
      signup({ name: trimmedName, email: trimmedEmail });
    }

    router.replace("/");
  }

  if (!hydrated) {
    return null;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={`type-label ${styles.kicker}`}>{messages.auth.kicker}</p>
        <h1 className={`type-heading-lg ${styles.title}`}>{messages.auth.title}</h1>
        <p className={`type-body-md ${styles.subtitle}`}>{messages.auth.subtitle}</p>

        <div className={styles.modeRow}>
          <button
            type="button"
            className={`${styles.modeButton} type-button ${mode === "login" ? styles.modeButtonActive : ""}`}
            onClick={() => setMode("login")}
          >
            {messages.auth.loginTab}
          </button>
          <button
            type="button"
            className={`${styles.modeButton} type-button ${mode === "signup" ? styles.modeButtonActive : ""}`}
            onClick={() => setMode("signup")}
          >
            {messages.auth.signupTab}
          </button>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={`type-label ${styles.label}`} htmlFor="name">
            {messages.auth.nameLabel}
          </label>
          <input
            id="name"
            className={`type-body-md ${styles.input}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={messages.auth.namePlaceholder}
          />

          <label className={`type-label ${styles.label}`} htmlFor="email">
            {messages.auth.emailLabel}
          </label>
          <input
            id="email"
            className={`type-body-md ${styles.input}`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={messages.auth.emailPlaceholder}
            required
          />

          <button type="submit" className={`${styles.submitButton} type-button`}>
            {mode === "login" ? messages.auth.loginAction : messages.auth.signupAction}
          </button>
        </form>
      </section>
    </main>
  );
}
