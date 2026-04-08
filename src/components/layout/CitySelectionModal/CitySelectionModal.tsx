"use client";

import { useState } from "react";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import type { SupportedCity } from "@/types/app";
import styles from "./CitySelectionModal.module.scss";

type CitySelectionModalProps = {
  title: string;
  description: string;
  selectLabel: string;
  saveLabel: string;
  options: Array<{
    value: SupportedCity;
    label: string;
  }>;
};

export function CitySelectionModal({
  title,
  description,
  selectLabel,
  saveLabel,
  options
}: CitySelectionModalProps) {
  const { hydrated, user, city, setCity } = useAppContext();
  const [draftCity, setDraftCity] = useState<SupportedCity | "">("");

  const shouldShow = hydrated && Boolean(user) && !city;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={`type-heading-lg ${styles.title}`}>{title}</h2>
        <p className={`type-body-md ${styles.description}`}>{description}</p>

        <label className={`type-label ${styles.label}`} htmlFor="city-select">
          {selectLabel}
        </label>
        <select
          id="city-select"
          className={`type-body-md ${styles.select}`}
          value={draftCity}
          onChange={(event) => setDraftCity(event.target.value as SupportedCity)}
        >
          <option value="">Select city</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`${styles.saveButton} type-button`}
          onClick={() => setCity(draftCity as SupportedCity)}
          disabled={!draftCity}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
