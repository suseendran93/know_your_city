"use client";

import { useEffect, useState } from "react";
import type { PlaceResult } from "@/types/location";
import { interpolate } from "@/lib/i18n";
import {
  getRouteConnectorChallenge,
  type RouteConnectorChallenge
} from "@/lib/game/getRouteConnectorChallenge";
import styles from "./RouteModeScreen.module.scss";

type SearchState = {
  query: string;
  results: PlaceResult[];
  loading: boolean;
  error: string;
};

const initialSearchState: SearchState = {
  query: "",
  results: [],
  loading: false,
  error: ""
};

type RouteModeScreenProps = {
  content: {
    header: {
      kicker: string;
      title: string;
      subtitle: string;
    };
    search: {
      fromLabel: string;
      toLabel: string;
      placeholder: string;
      selectedPrefix: string;
      noResults: string;
    };
    game: {
      instruction: string;
      challengeTitle: string;
      submitHint: string;
      selectedCount: string;
      answerCorrect: string;
      answerPartial: string;
      answerWrong: string;
      expectedLabel: string;
    };
    errors: {
      searchFailed: string;
      invalidSelection: string;
    };
  };
  actions: {
    reset: string;
    submitAnswer: string;
    generateChallenge: string;
  };
  status: {
    searching: string;
  };
};

async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const response = await fetch(`/api/places/search?q=${encodeURIComponent(query)}&limit=5`);
  const payload = (await response.json()) as { places?: PlaceResult[]; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to search places.");
  }

  return payload.places ?? [];
}

export function RouteModeScreen({ content, actions, status }: RouteModeScreenProps) {
  const [fromSearch, setFromSearch] = useState<SearchState>(initialSearchState);
  const [toSearch, setToSearch] = useState<SearchState>(initialSearchState);
  const [selectedFrom, setSelectedFrom] = useState<PlaceResult | null>(null);
  const [selectedTo, setSelectedTo] = useState<PlaceResult | null>(null);
  const [challenge, setChallenge] = useState<RouteConnectorChallenge | null>(null);
  const [selectedConnectorIds, setSelectedConnectorIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canGenerate = Boolean(selectedFrom && selectedTo && selectedFrom.id !== selectedTo.id);
  const selectedCount = selectedConnectorIds.length;

  useDebouncedSearch(
    fromSearch.query,
    selectedFrom,
    content.search.noResults,
    content.errors.searchFailed,
    setFromSearch
  );
  useDebouncedSearch(
    toSearch.query,
    selectedTo,
    content.search.noResults,
    content.errors.searchFailed,
    setToSearch
  );

  function updateQuery(side: "from" | "to", query: string) {
    const nextState = {
      query,
      results: [],
      loading: query.trim().length >= 2,
      error: ""
    };

    if (side === "from") {
      setSelectedFrom(null);
      setFromSearch(nextState);
    } else {
      setSelectedTo(null);
      setToSearch(nextState);
    }

    setChallenge(null);
    setSubmitted(false);
    setErrorMessage("");
    setSelectedConnectorIds([]);
  }

  function selectPlace(side: "from" | "to", place: PlaceResult) {
    if (side === "from") {
      setSelectedFrom(place);
      setFromSearch({
        query: place.name,
        results: [],
        loading: false,
        error: ""
      });
    } else {
      setSelectedTo(place);
      setToSearch({
        query: place.name,
        results: [],
        loading: false,
        error: ""
      });
    }
  }

  function generateChallenge() {
    if (!selectedFrom || !selectedTo || selectedFrom.id === selectedTo.id) {
      return;
    }

    setChallenge(getRouteConnectorChallenge(selectedFrom, selectedTo));
    setSelectedConnectorIds([]);
    setSubmitted(false);
    setErrorMessage("");
  }

  function toggleConnector(connectorId: string) {
    if (submitted) {
      return;
    }

    setSelectedConnectorIds((previous) => {
      if (previous.includes(connectorId)) {
        return previous.filter((value) => value !== connectorId);
      }

      if (previous.length >= 3) {
        return previous;
      }

      return [...previous, connectorId];
    });
  }

  function submitAnswer() {
    if (!challenge) {
      return;
    }

    if (selectedConnectorIds.length < 2 || selectedConnectorIds.length > 3) {
      setErrorMessage(content.errors.invalidSelection);
      return;
    }

    setErrorMessage("");
    setSubmitted(true);
  }

  function resetAll() {
    setFromSearch(initialSearchState);
    setToSearch(initialSearchState);
    setSelectedFrom(null);
    setSelectedTo(null);
    setChallenge(null);
    setSelectedConnectorIds([]);
    setSubmitted(false);
    setErrorMessage("");
  }

  const feedback = getFeedbackMessage(content.game, challenge, selectedConnectorIds, submitted);

  return (
    <section className={styles.screen}>
      <div className={styles.header}>
        <p className={`type-label ${styles.kicker}`}>{content.header.kicker}</p>
        <h1 className={`type-heading-lg ${styles.title}`}>{content.header.title}</h1>
        <p className={`type-body-md ${styles.subtitle}`}>{content.header.subtitle}</p>
      </div>

      <div className={styles.setupGrid}>
        <PlaceSearchCard
          title={content.search.fromLabel}
          value={fromSearch.query}
          loading={fromSearch.loading}
          error={fromSearch.error}
          results={fromSearch.results}
          selectedPlace={selectedFrom}
          placeholder={content.search.placeholder}
          selectedPrefix={content.search.selectedPrefix}
          searchingLabel={status.searching}
          onChange={(query) => updateQuery("from", query)}
          onSelect={(place) => selectPlace("from", place)}
        />
        <PlaceSearchCard
          title={content.search.toLabel}
          value={toSearch.query}
          loading={toSearch.loading}
          error={toSearch.error}
          results={toSearch.results}
          selectedPlace={selectedTo}
          placeholder={content.search.placeholder}
          selectedPrefix={content.search.selectedPrefix}
          searchingLabel={status.searching}
          onChange={(query) => updateQuery("to", query)}
          onSelect={(place) => selectPlace("to", place)}
        />
      </div>

      <div className={styles.ctaRow}>
        <button
          type="button"
          className={`${styles.primaryButton} type-button`}
          onClick={generateChallenge}
          disabled={!canGenerate}
        >
          {actions.generateChallenge}
        </button>
        <button type="button" className={`${styles.secondaryButton} type-button`} onClick={resetAll}>
          {actions.reset}
        </button>
      </div>

      {challenge ? (
        <div className={styles.challengeCard}>
          <p className={`type-label ${styles.challengeKicker}`}>{content.game.challengeTitle}</p>
          <h2 className={`type-heading-md ${styles.challengeTitle}`}>
            {interpolate(content.game.instruction, {
              from: selectedFrom?.name ?? "",
              to: selectedTo?.name ?? ""
            })}
          </h2>
          <p className={`type-body-sm ${styles.hint}`}>{content.game.submitHint}</p>
          <p className={`type-body-sm ${styles.countText}`}>
            {interpolate(content.game.selectedCount, { count: selectedCount })}
          </p>

          <div className={styles.connectorGrid}>
            {challenge.connectorOptions.map((connector) => {
              const isSelected = selectedConnectorIds.includes(connector.id);
              const expected = challenge.expectedConnectors.some(
                (expectedConnector) => expectedConnector.id === connector.id
              );
              const showCorrect = submitted && expected;
              const showWrong = submitted && isSelected && !expected;

              return (
                <button
                  key={connector.id}
                  type="button"
                  onClick={() => toggleConnector(connector.id)}
                  className={[
                    styles.connectorButton,
                    "type-button",
                    isSelected ? styles.connectorButtonSelected : "",
                    showCorrect ? styles.connectorButtonCorrect : "",
                    showWrong ? styles.connectorButtonWrong : ""
                  ].join(" ")}
                >
                  {connector.name}
                </button>
              );
            })}
          </div>

          {errorMessage ? <p className={`type-body-sm ${styles.errorText}`}>{errorMessage}</p> : null}
          {submitted && feedback ? <p className={`type-body-md ${styles.feedback}`}>{feedback}</p> : null}

          {submitted ? (
            <>
              <p className={`type-body-sm ${styles.expectedText}`}>
                {content.game.expectedLabel}{" "}
                {challenge.expectedConnectors.map((connector) => connector.name).join(", ")}
              </p>
              <button
                type="button"
                className={`${styles.primaryButton} ${styles.nextButton} type-button`}
                onClick={resetAll}
              >
                {actions.reset}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${styles.primaryButton} ${styles.nextButton} type-button`}
              onClick={submitAnswer}
            >
              {actions.submitAnswer}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

function getFeedbackMessage(
  gameContent: RouteModeScreenProps["content"]["game"],
  challenge: RouteConnectorChallenge | null,
  selectedConnectorIds: string[],
  submitted: boolean
) {
  if (!challenge || !submitted) {
    return "";
  }

  const expectedIds = challenge.expectedConnectors.map((connector) => connector.id);
  const correctPicks = selectedConnectorIds.filter((connectorId) => expectedIds.includes(connectorId)).length;

  if (correctPicks === expectedIds.length && selectedConnectorIds.length === expectedIds.length) {
    return gameContent.answerCorrect;
  }

  if (correctPicks > 0) {
    return interpolate(gameContent.answerPartial, { count: correctPicks, total: expectedIds.length });
  }

  return gameContent.answerWrong;
}

function useDebouncedSearch(
  query: string,
  selectedPlace: PlaceResult | null,
  noResultsLabel: string,
  searchFailedLabel: string,
  setState: (value: SearchState | ((previousState: SearchState) => SearchState)) => void
) {
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setState((previousState) => ({
        ...previousState,
        results: [],
        loading: false,
        error: ""
      }));
      return;
    }

    if (selectedPlace && selectedPlace.name === trimmedQuery) {
      setState((previousState) => ({
        ...previousState,
        results: [],
        loading: false,
        error: ""
      }));
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const places = await searchPlaces(trimmedQuery);

        setState((previousState) => {
          if (previousState.query.trim() !== trimmedQuery) {
            return previousState;
          }

          return {
            ...previousState,
            results: places,
            loading: false,
            error: places.length === 0 ? noResultsLabel : ""
          };
        });
      } catch (error) {
        setState((previousState) => {
          if (previousState.query.trim() !== trimmedQuery) {
            return previousState;
          }

          return {
            ...previousState,
            results: [],
            loading: false,
            error: error instanceof Error ? error.message : searchFailedLabel
          };
        });
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [noResultsLabel, query, searchFailedLabel, selectedPlace, setState]);
}

type PlaceSearchCardProps = {
  title: string;
  value: string;
  loading: boolean;
  error: string;
  results: PlaceResult[];
  selectedPlace: PlaceResult | null;
  placeholder: string;
  selectedPrefix: string;
  searchingLabel: string;
  onChange: (query: string) => void;
  onSelect: (place: PlaceResult) => void;
};

function PlaceSearchCard({
  title,
  value,
  loading,
  error,
  results,
  selectedPlace,
  placeholder,
  selectedPrefix,
  searchingLabel,
  onChange,
  onSelect
}: PlaceSearchCardProps) {
  return (
    <article className={styles.searchCard}>
      <label className={`type-label ${styles.searchLabel}`}>{title}</label>
      <input
        className={`type-body-md ${styles.searchInput}`}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />

      {selectedPlace ? (
        <p className={`type-body-sm ${styles.selectedPlace}`}>
          {selectedPrefix} {selectedPlace.fullAddress}
        </p>
      ) : null}
      {loading ? <p className={`type-body-sm ${styles.statusText}`}>{searchingLabel}</p> : null}
      {error ? <p className={`type-body-sm ${styles.errorText}`}>{error}</p> : null}

      {results.length > 0 ? (
        <div className={styles.resultsList}>
          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              className={styles.resultItem}
              onClick={() => onSelect(place)}
            >
              <span className={`type-body-md ${styles.resultName}`}>{place.name}</span>
              <span className={`type-body-sm ${styles.resultAddress}`}>{place.fullAddress}</span>
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
