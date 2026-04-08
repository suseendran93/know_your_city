"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import { getMessages } from "@/lib/i18n";
import styles from "./page.module.scss";

export default function AuthPage() {
  const router = useRouter();
  const messages = getMessages();
  const { hydrated, firebaseEnabled, user, login, signup, forgotPassword } = useAppContext();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedName = name.trim() || "Player";
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return;
    }

    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email: trimmedEmail, password: trimmedPassword });
      } else {
        await signup({ name: trimmedName, email: trimmedEmail, password: trimmedPassword });
      }

      router.replace("/");
    } catch (submitError) {
      setError(mapAuthErrorToMessage(submitError, messages.auth.errors));
    } finally {
      setSubmitting(false);
    }
  }

  async function onForgotPassword() {
    const trimmedEmail = email.trim();

    setError("");
    setNotice("");

    if (!trimmedEmail) {
      setError(messages.auth.errors.missingEmail);
      return;
    }

    setSubmitting(true);

    try {
      await forgotPassword(trimmedEmail);
      setNotice(messages.auth.resetSent);
    } catch (forgotError) {
      setError(mapAuthErrorToMessage(forgotError, messages.auth.errors));
    } finally {
      setSubmitting(false);
    }
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
        {!firebaseEnabled ? <p className={`type-body-sm ${styles.error}`}>{messages.auth.firebaseMissing}</p> : null}
        {notice ? <p className={`type-body-sm ${styles.notice}`}>{notice}</p> : null}
        {error ? <p className={`type-body-sm ${styles.error}`}>{error}</p> : null}

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
          {mode === "signup" ? (
            <>
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
            </>
          ) : null}

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

          <label className={`type-label ${styles.label}`} htmlFor="password">
            {messages.auth.passwordLabel}
          </label>
          <input
            id="password"
            className={`type-body-md ${styles.input}`}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={messages.auth.passwordPlaceholder}
            required
            minLength={6}
          />

          <button type="submit" className={`${styles.submitButton} type-button`} disabled={submitting}>
            {mode === "login" ? messages.auth.loginAction : messages.auth.signupAction}
          </button>

          {mode === "login" ? (
            <button
              type="button"
              className={`${styles.linkButton} type-button`}
              onClick={onForgotPassword}
              disabled={submitting}
            >
              {messages.auth.forgotPasswordAction}
            </button>
          ) : null}
        </form>
      </section>
    </main>
  );
}

function mapAuthErrorToMessage(
  error: unknown,
  labels: {
    default: string;
    missingEmail: string;
    invalidEmail: string;
    invalidCredential: string;
    wrongPassword: string;
    userNotFound: string;
    emailInUse: string;
    weakPassword: string;
    tooManyRequests: string;
    network: string;
    configurationNotFound: string;
    operationNotAllowed: string;
    apiKeyInvalid: string;
  }
) {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  const rawMessage =
    error && typeof error === "object" && "message" in error ? String(error.message) : "";
  const normalizedCode = code.toLowerCase();
  const normalizedMessage = rawMessage.toLowerCase();

  if (
    normalizedCode.includes("configuration-not-found") ||
    normalizedMessage.includes("configuration_not_found")
  ) {
    return labels.configurationNotFound;
  }

  if (
    normalizedCode.includes("operation-not-allowed") ||
    normalizedMessage.includes("operation_not_allowed")
  ) {
    return labels.operationNotAllowed;
  }

  if (
    normalizedCode.includes("invalid-api-key") ||
    normalizedMessage.includes("api key not valid") ||
    normalizedMessage.includes("apikey")
  ) {
    return labels.apiKeyInvalid;
  }

  switch (normalizedCode) {
    case "auth/invalid-email":
      return labels.invalidEmail;
    case "auth/invalid-credential":
      return labels.invalidCredential;
    case "auth/wrong-password":
      return labels.wrongPassword;
    case "auth/user-not-found":
      return labels.userNotFound;
    case "auth/email-already-in-use":
      return labels.emailInUse;
    case "auth/weak-password":
      return labels.weakPassword;
    case "auth/too-many-requests":
      return labels.tooManyRequests;
    case "auth/network-request-failed":
      return labels.network;
    default:
      return labels.default;
  }
}
