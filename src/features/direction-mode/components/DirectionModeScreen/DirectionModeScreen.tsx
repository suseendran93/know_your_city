"use client";

import { useEffect, useState } from "react";
import { getPrimaryDirection, type DirectionAnswer } from "@/lib/game/getPrimaryDirection";
import type { NearbyPlaceResult, PlaceResult } from "@/types/location";
import styles from "./DirectionModeScreen.module.scss";

type SearchState = {
  query: string;
  results: PlaceResult[];
  loading: boolean;
  error: string;
};

type RoundQuestion = {
  id: string;
  from: PlaceResult;
  to: PlaceResult;
  answer: DirectionAnswer;
};

const directionOptions: DirectionAnswer[] = ["North", "South", "East", "West"];
const roundSize = 5;

const initialSearchState: SearchState = {
  query: "",
  results: [],
  loading: false,
  error: ""
};

async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const response = await fetch(`/api/places/search?q=${encodeURIComponent(query)}&limit=5`);
  const payload = (await response.json()) as { places?: PlaceResult[]; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to search places.");
  }

  return payload.places ?? [];
}

async function fetchNearbyPlaces(place: PlaceResult): Promise<NearbyPlaceResult[]> {
  const response = await fetch(
    `/api/places/nearby?lat=${place.lat}&lng=${place.lng}&radius=3000&limit=12`
  );
  const payload = (await response.json()) as { places?: NearbyPlaceResult[]; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to fetch nearby places.");
  }

  return payload.places ?? [];
}

function buildRoundQuestions(fromPlace: PlaceResult, toPlace: PlaceResult, nearbyPlaces: PlaceResult[]) {
  const normalizedFromName = normalizePlaceName(fromPlace.name);
  const uniqueTargets = [toPlace, ...nearbyPlaces].filter(
    (place, index, array) =>
      place.id !== fromPlace.id &&
      normalizePlaceName(place.name) !== normalizedFromName &&
      array.findIndex((candidate) => candidate.id === place.id) === index
  );

  return uniqueTargets.slice(0, roundSize).map((place, index) => ({
    id: `${fromPlace.id}-${place.id}-${index}`,
    from: fromPlace,
    to: place,
    answer: getPrimaryDirection(fromPlace, place)
  }));
}

function normalizePlaceName(name: string) {
  return name.trim().toLowerCase();
}

export function DirectionModeScreen() {
  const [fromSearch, setFromSearch] = useState<SearchState>(initialSearchState);
  const [toSearch, setToSearch] = useState<SearchState>(initialSearchState);
  const [selectedFrom, setSelectedFrom] = useState<PlaceResult | null>(null);
  const [selectedTo, setSelectedTo] = useState<PlaceResult | null>(null);
  const [questions, setQuestions] = useState<RoundQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<DirectionAnswer | null>(null);
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [roundLoading, setRoundLoading] = useState(false);
  const [roundError, setRoundError] = useState("");

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isRoundComplete = questions.length > 0 && currentQuestionIndex >= questions.length;
  const canStart = Boolean(selectedFrom && selectedTo && selectedFrom.id !== selectedTo.id && !roundLoading);

  useDebouncedSearch(fromSearch.query, selectedFrom, setFromSearch);
  useDebouncedSearch(toSearch.query, selectedTo, setToSearch);

  function updateQuery(side: "from" | "to", query: string) {
    const nextState = {
      query,
      results: [],
      loading: query.trim().length >= 2,
      error: ""
    };

    if (side === "from") {
      setSelectedFrom(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setRoundError("");
      setFromSearch(nextState);
      return;
    }

    setSelectedTo(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setHasAnswered(false);
    setSelectedAnswer(null);
    setRoundError("");
    setToSearch(nextState);
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
      return;
    }

    setSelectedTo(place);
    setToSearch({
      query: place.name,
      results: [],
      loading: false,
      error: ""
    });
  }

  async function startRound() {
    if (!selectedFrom || !selectedTo || selectedFrom.id === selectedTo.id) {
      return;
    }

    setRoundLoading(true);
    setRoundError("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setScore(0);

    try {
      const nearbyPlaces = await fetchNearbyPlaces(selectedFrom);
      const normalizedNearbyPlaces: PlaceResult[] = nearbyPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        fullAddress: place.fullAddress,
        lat: place.lat,
        lng: place.lng,
        category: place.category,
        city: place.city,
        state: place.state,
        country: place.country
      }));

      const nextQuestions = buildRoundQuestions(selectedFrom, selectedTo, normalizedNearbyPlaces);

      if (nextQuestions.length < roundSize) {
        setRoundError("Could not build 5 questions for this place yet. Try a bigger area or landmark.");
        setRoundLoading(false);
        return;
      }

      setQuestions(nextQuestions);
    } catch (error) {
      setRoundError(error instanceof Error ? error.message : "Failed to create the question set.");
    } finally {
      setRoundLoading(false);
    }
  }

  function submitAnswer(answer: DirectionAnswer) {
    if (!currentQuestion || hasAnswered) {
      return;
    }

    setSelectedAnswer(answer);
    setHasAnswered(true);

    if (answer === currentQuestion.answer) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function goToNextQuestion() {
    if (!currentQuestion) {
      return;
    }

    const nextIndex = currentQuestionIndex + 1;

    setCurrentQuestionIndex(nextIndex);
    setSelectedAnswer(null);
    setHasAnswered(false);
  }

  function resetRound() {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setScore(0);
    setRoundLoading(false);
    setRoundError("");
    setSelectedFrom(null);
    setSelectedTo(null);
    setFromSearch(initialSearchState);
    setToSearch(initialSearchState);
  }

  return (
    <section className={styles.screen}>
      <div className={styles.header}>
        <p className={`type-label ${styles.kicker}`}>Direction mode</p>
        <h1 className={`type-heading-lg ${styles.title}`}>Pick two real places and play five quick questions.</h1>
        <p className={`type-body-md ${styles.subtitle}`}>
          Search starts while you type. The app uses live free place data, then builds a short
          direction round from the selected area.
        </p>
      </div>

      <div className={styles.scoreCard}>
        <div>
          <span className="type-label">Score</span>
          <strong className={`type-heading-md ${styles.scoreValue}`}>{score}</strong>
        </div>
        <div className={styles.scoreMeta}>
          <span className="type-label">Round</span>
          <strong className="type-heading-md">
            {questions.length === 0 ? 0 : Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length || roundSize}
          </strong>
        </div>
      </div>

      <div className={styles.setupGrid}>
        <PlaceSearchCard
          title="From place"
          value={fromSearch.query}
          loading={fromSearch.loading}
          error={fromSearch.error}
          results={fromSearch.results}
          selectedPlace={selectedFrom}
          onChange={(query) => updateQuery("from", query)}
          onSelect={(place) => selectPlace("from", place)}
        />
        <PlaceSearchCard
          title="To place"
          value={toSearch.query}
          loading={toSearch.loading}
          error={toSearch.error}
          results={toSearch.results}
          selectedPlace={selectedTo}
          onChange={(query) => updateQuery("to", query)}
          onSelect={(place) => selectPlace("to", place)}
        />
      </div>

      <div className={styles.ctaRow}>
        <button
          type="button"
          className={`${styles.primaryButton} type-button`}
          disabled={!canStart}
          onClick={startRound}
        >
          {roundLoading ? "Building Round..." : "Start 5 Questions"}
        </button>
        <button type="button" className={`${styles.secondaryButton} type-button`} onClick={resetRound}>
          Reset
        </button>
      </div>

      {roundError ? <p className={`type-body-sm ${styles.errorText}`}>{roundError}</p> : null}

      {currentQuestion ? (
        <div className={styles.questionCard}>
          <p className={`type-label ${styles.questionLabel}`}>Question {currentQuestionIndex + 1}</p>
          <h2 className={`type-heading-md ${styles.questionTitle}`}>
            Where is {currentQuestion.to.name} from {currentQuestion.from.name}?
          </h2>

          <div className={styles.answerGrid}>
            {directionOptions.map((option) => {
              const isCorrect = hasAnswered && option === currentQuestion.answer;
              const isWrong = hasAnswered && selectedAnswer === option && option !== currentQuestion.answer;

              return (
                <button
                  key={option}
                  type="button"
                  className={[
                    styles.answerButton,
                    "type-button",
                    isCorrect ? styles.answerButtonCorrect : "",
                    isWrong ? styles.answerButtonWrong : ""
                  ].join(" ")}
                  onClick={() => submitAnswer(option)}
                  disabled={hasAnswered}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {hasAnswered ? (
            <>
              <p className={`type-body-md ${styles.feedback}`}>
                {selectedAnswer === currentQuestion.answer
                  ? `Correct. ${currentQuestion.to.name} is ${currentQuestion.answer.toLowerCase()} of ${currentQuestion.from.name}.`
                  : `Not quite. The best answer is ${currentQuestion.answer}.`}
              </p>
              <button
                type="button"
                className={`${styles.primaryButton} ${styles.nextButton} type-button`}
                onClick={goToNextQuestion}
              >
                {currentQuestionIndex === questions.length - 1 ? "Finish Round" : "Next Question"}
              </button>
            </>
          ) : (
            <p className={`type-body-sm ${styles.hint}`}>Choose the strongest direction based on the coordinates.</p>
          )}
        </div>
      ) : null}

      {isRoundComplete ? (
        <div className={styles.questionCard}>
          <p className={`type-label ${styles.questionLabel}`}>Round complete</p>
          <h2 className={`type-heading-md ${styles.questionTitle}`}>You scored {score} out of {questions.length}.</h2>
          <p className={`type-body-md ${styles.feedback}`}>
            Keep the same places and start again, or reset and try a different pair.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function useDebouncedSearch(
  query: string,
  selectedPlace: PlaceResult | null,
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
            error: places.length === 0 ? "No places found." : ""
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
            error: error instanceof Error ? error.message : "Failed to search places."
          };
        });
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [query, selectedPlace, setState]);
}

type PlaceSearchCardProps = {
  title: string;
  value: string;
  loading: boolean;
  error: string;
  results: PlaceResult[];
  selectedPlace: PlaceResult | null;
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
  onChange,
  onSelect
}: PlaceSearchCardProps) {
  return (
    <article className={styles.searchCard}>
      <label className={`type-label ${styles.searchLabel}`}>{title}</label>
      <div className={styles.searchRow}>
        <input
          className={`type-body-md ${styles.searchInput}`}
          type="text"
          value={value}
          placeholder="Search a city, area, or landmark"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      {selectedPlace ? (
        <p className={`type-body-sm ${styles.selectedPlace}`}>{selectedPlace.fullAddress}</p>
      ) : null}

      {loading ? <p className={`type-body-sm ${styles.statusText}`}>Searching...</p> : null}
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
