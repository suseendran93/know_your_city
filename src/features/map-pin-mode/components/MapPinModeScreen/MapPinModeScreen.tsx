"use client";

import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import { interpolate } from "@/lib/i18n";
import type { PlaceResult } from "@/types/location";
import styles from "./MapPinModeScreen.module.scss";

type MapPinModeScreenProps = {
  cityName: string;
  content: {
    header: {
      kicker: string;
      title: string;
      subtitle: string;
    };
    game: {
      roundLabel: string;
      instruction: string;
      submitHint: string;
      difficultyLabel: string;
      preSubmitHintLabel: string;
      warmVeryClose: string;
      warmClose: string;
      warmFar: string;
      feedbackPerfect: string;
      feedbackClose: string;
      feedbackFar: string;
      revealLabel: string;
      scoreLabel: string;
      scoreResult: string;
      loadingPlaces: string;
    };
    errors: {
      noPlaces: string;
      loadFailed: string;
      selectPin: string;
    };
  };
  actions: {
    startRound: string;
    submitPin: string;
    clearPin: string;
    nextQuestion: string;
    finishRound: string;
    reset: string;
  };
};

type Question = {
  id: string;
  place: PlaceResult;
};

type Guess = {
  lat: number;
  lng: number;
};

type CityMapConfig = {
  center: [number, number];
  bounds: [[number, number], [number, number]];
  zoom: number;
};

type LeafletModule = typeof import("leaflet");
type Difficulty = "easy" | "medium" | "hard";

type DifficultyConfig = {
  key: Difficulty;
  perfectMeters: number;
  closeMeters: number;
  assistRadiusMeters: number;
};

const roundSize = 5;
const minimalRoutesTileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";
const labelsOnlyTileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png";
const cartoAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const difficultyOrder: Difficulty[] = ["easy", "medium", "hard"];
const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  easy: {
    key: "easy",
    perfectMeters: 500,
    closeMeters: 1400,
    assistRadiusMeters: 1400
  },
  medium: {
    key: "medium",
    perfectMeters: 300,
    closeMeters: 900,
    assistRadiusMeters: 900
  },
  hard: {
    key: "hard",
    perfectMeters: 180,
    closeMeters: 650,
    assistRadiusMeters: 650
  }
};

const cityMapConfigs: Record<string, CityMapConfig> = {
  Chennai: {
    center: [13.0827, 80.2707],
    bounds: [
      [12.82, 80.03],
      [13.28, 80.36]
    ],
    zoom: 11
  },
  Bangalore: {
    center: [12.9716, 77.5946],
    bounds: [
      [12.78, 77.38],
      [13.16, 77.78]
    ],
    zoom: 11
  }
};

function getCityConfig(cityName: string): CityMapConfig {
  return cityMapConfigs[cityName] ?? cityMapConfigs.Chennai;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMeters(a: Guess, b: Guess) {
  const earthRadius = 6371000;
  const latDelta = toRadians(b.lat - a.lat);
  const lngDelta = toRadians(b.lng - a.lng);
  const latA = toRadians(a.lat);
  const latB = toRadians(b.lat);

  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(latA) * Math.cos(latB) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function buildQuestions(places: PlaceResult[]) {
  return places.slice(0, roundSize).map((place, index) => ({
    id: `${place.id}-${index}`,
    place
  }));
}

async function fetchCityPlaces(cityName: string): Promise<PlaceResult[]> {
  const fallbackQueries = ["metro station", "market", "museum", "park", "mall", "bus stand", "temple"];

  const settled = await Promise.allSettled(
    fallbackQueries.map(async (query) => {
      const response = await fetch(
        `/api/places/search?q=${encodeURIComponent(query)}&limit=8&city=${encodeURIComponent(cityName)}`
      );
      const payload = (await response.json()) as { places?: PlaceResult[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to search places.");
      }

      return payload.places ?? [];
    })
  );

  const merged = settled
    .filter((result): result is PromiseFulfilledResult<PlaceResult[]> => result.status === "fulfilled")
    .flatMap((result) => result.value);

  const unique = merged.filter(
    (place, index, places) =>
      places.findIndex(
        (candidate) =>
          candidate.id === place.id ||
          candidate.name.trim().toLowerCase() === place.name.trim().toLowerCase()
      ) === index
  );

  return unique;
}

export function MapPinModeScreen({ cityName, content, actions }: MapPinModeScreenProps) {
  const { recordGameResult } = useAppContext();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const guessLayerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const assistRingLayerRef = useRef<import("leaflet").Circle | null>(null);
  const hoverRingLayerRef = useRef<import("leaflet").Circle | null>(null);
  const actualLayerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const submittedRef = useRef(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [guess, setGuess] = useState<Guess | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoverGuess, setHoverGuess] = useState<Guess | null>(null);
  const [preSubmitHint, setPreSubmitHint] = useState("");
  const [error, setError] = useState("");
  const [loadingRound, setLoadingRound] = useState(false);
  const [resultCommitted, setResultCommitted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const cityConfig = getCityConfig(cityName);
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isRoundActive = questions.length > 0 && currentQuestionIndex < questions.length;
  const isRoundComplete = questions.length > 0 && currentQuestionIndex >= questions.length;
  const activeDifficulty = difficultyConfig[difficulty];

  useEffect(() => {
    if (!isRoundComplete || resultCommitted) {
      return;
    }

    setResultCommitted(true);
    void recordGameResult("mapPinMode", score);
  }, [isRoundComplete, recordGameResult, resultCommitted, score]);

  useEffect(() => {
    submittedRef.current = hasSubmitted;
  }, [hasSubmitted]);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    if (!isRoundActive) {
      mapRef.current?.remove();
      mapRef.current = null;
      return;
    }

    let mounted = true;

    async function setupMap() {
      if (!mapContainerRef.current) {
        return;
      }

      const L = await import("leaflet");
      leafletRef.current = L;

      if (!mounted) {
        return;
      }

      mapRef.current?.remove();

      const map = L.map(mapContainerRef.current, {
        center: cityConfig.center,
        zoom: cityConfig.zoom,
        maxBounds: cityConfig.bounds,
        minZoom: 10
      });

      // Base layer keeps roads and borders clear while hiding most POI noise.
      L.tileLayer(minimalRoutesTileUrl, {
        attribution: cartoAttribution,
        maxZoom: 19
      }).addTo(map);

      // Label layer renders names above the base without adding extra visual clutter.
      L.tileLayer(labelsOnlyTileUrl, {
        attribution: cartoAttribution,
        maxZoom: 19,
        pane: "overlayPane"
      }).addTo(map);

      map.on("click", (event) => {
        if (submittedRef.current) {
          return;
        }

        const nextGuess = {
          lat: event.latlng.lat,
          lng: event.latlng.lng
        };
        setGuess(nextGuess);
        setHoverGuess(null);
      });

      map.on("mousemove", (event) => {
        if (submittedRef.current) {
          return;
        }

        setHoverGuess({
          lat: event.latlng.lat,
          lng: event.latlng.lng
        });
      });

      map.on("mouseout", () => {
        setHoverGuess(null);
      });

      mapRef.current = map;
    }

    void setupMap();

    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [cityConfig.bounds, cityConfig.center, cityConfig.zoom, cityName, isRoundActive]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;

    if (!L || !map) {
      return;
    }

    if (guessLayerRef.current) {
      map.removeLayer(guessLayerRef.current);
      guessLayerRef.current = null;
    }
    if (assistRingLayerRef.current) {
      map.removeLayer(assistRingLayerRef.current);
      assistRingLayerRef.current = null;
    }

    if (!guess) {
      return;
    }

    guessLayerRef.current = L.circleMarker([guess.lat, guess.lng], {
      radius: 8,
      color: "#0e7490",
      fillColor: "#0e7490",
      fillOpacity: 0.9
    }).addTo(map);

    assistRingLayerRef.current = L.circle([guess.lat, guess.lng], {
      radius: activeDifficulty.assistRadiusMeters,
      color: "#0e7490",
      fillColor: "#0e7490",
      fillOpacity: 0.14,
      weight: 1
    }).addTo(map);
  }, [activeDifficulty.assistRadiusMeters, guess]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;

    if (!L || !map) {
      return;
    }

    if (hoverRingLayerRef.current) {
      map.removeLayer(hoverRingLayerRef.current);
      hoverRingLayerRef.current = null;
    }

    if (!hoverGuess || guess || hasSubmitted) {
      return;
    }

    hoverRingLayerRef.current = L.circle([hoverGuess.lat, hoverGuess.lng], {
      radius: activeDifficulty.assistRadiusMeters,
      color: "#0369a1",
      fillColor: "#0369a1",
      fillOpacity: 0.08,
      weight: 1,
      dashArray: "4 4"
    }).addTo(map);
  }, [activeDifficulty.assistRadiusMeters, guess, hasSubmitted, hoverGuess]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;

    if (!L || !map || !currentQuestion) {
      return;
    }

    if (actualLayerRef.current) {
      map.removeLayer(actualLayerRef.current);
      actualLayerRef.current = null;
    }

    if (!hasSubmitted) {
      return;
    }

    actualLayerRef.current = L.circleMarker([currentQuestion.place.lat, currentQuestion.place.lng], {
      radius: 10,
      color: "#c53030",
      fillColor: "#c53030",
      fillOpacity: 0.9
    }).addTo(map);
  }, [currentQuestion, hasSubmitted]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (currentQuestion && hasSubmitted) {
      map.flyTo([currentQuestion.place.lat, currentQuestion.place.lng], 12, { duration: 0.6 });
      return;
    }

    map.flyTo(cityConfig.center, cityConfig.zoom, { duration: 0.4 });
  }, [cityConfig.center, cityConfig.zoom, currentQuestion, hasSubmitted]);

  useEffect(() => {
    if (!guess || !currentQuestion || hasSubmitted) {
      setPreSubmitHint("");
      return;
    }

    const distance = distanceMeters(guess, {
      lat: currentQuestion.place.lat,
      lng: currentQuestion.place.lng
    });

    if (distance <= activeDifficulty.perfectMeters) {
      setPreSubmitHint(content.game.warmVeryClose);
      return;
    }

    if (distance <= activeDifficulty.closeMeters) {
      setPreSubmitHint(content.game.warmClose);
      return;
    }

    setPreSubmitHint(content.game.warmFar);
  }, [
    activeDifficulty.closeMeters,
    activeDifficulty.perfectMeters,
    content.game.warmClose,
    content.game.warmFar,
    content.game.warmVeryClose,
    currentQuestion,
    guess,
    hasSubmitted
  ]);

  async function startRound() {
    setLoadingRound(true);
    setError("");
    setFeedback("");
    setPreSubmitHint("");
    setHoverGuess(null);
    setGuess(null);
    setHasSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setResultCommitted(false);

    try {
      const places = await fetchCityPlaces(cityName);

      if (places.length < roundSize) {
        setError(content.errors.noPlaces);
        return;
      }

      setQuestions(buildQuestions(places));
    } catch {
      setError(content.errors.loadFailed);
    } finally {
      setLoadingRound(false);
    }
  }

  function resetRound() {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setGuess(null);
    setHoverGuess(null);
    setHasSubmitted(false);
    setScore(0);
    setFeedback("");
    setPreSubmitHint("");
    setError("");
    setResultCommitted(false);
  }

  function submitPin() {
    if (!currentQuestion) {
      return;
    }

    if (!guess) {
      setError(content.errors.selectPin);
      return;
    }

    setError("");
    setHasSubmitted(true);

    const distance = distanceMeters(guess, {
      lat: currentQuestion.place.lat,
      lng: currentQuestion.place.lng
    });
    const isWithinRange = distance <= activeDifficulty.assistRadiusMeters;

    if (isWithinRange) {
      setScore((current) => current + 1);
    }

    if (distance <= activeDifficulty.perfectMeters) {
      setFeedback(
        `${content.game.feedbackPerfect} ${interpolate(content.game.revealLabel, {
          meters: Math.round(distance)
        })}`
      );
      return;
    }

    if (distance <= activeDifficulty.closeMeters) {
      setScore((current) => current + 1);
      setFeedback(
        `${content.game.feedbackClose} ${interpolate(content.game.revealLabel, {
          meters: Math.round(distance)
        })}`
      );
      return;
    }

    setFeedback(
      `${content.game.feedbackFar} ${interpolate(content.game.revealLabel, {
        meters: Math.round(distance)
      })}`
    );
  }

  function clearPin() {
    setGuess(null);
    setHoverGuess(null);
    setPreSubmitHint("");
    setError("");
  }

  function goNextQuestion() {
    setCurrentQuestionIndex((index) => index + 1);
    setGuess(null);
    setHoverGuess(null);
    setHasSubmitted(false);
    setFeedback("");
    setPreSubmitHint("");
    setError("");
  }

  return (
    <section className={styles.screen}>
      <div className={styles.header}>
        <p className={`type-label ${styles.kicker}`}>{content.header.kicker}</p>
        <h1 className={`type-heading-lg ${styles.title}`}>{content.header.title}</h1>
        <p className={`type-body-md ${styles.subtitle}`}>{content.header.subtitle}</p>
      </div>

      <div className={styles.topRow}>
        <div className={styles.scoreCard}>
          <span className="type-label">{content.game.scoreLabel}</span>
          <strong className="type-heading-md">{score}</strong>
        </div>
        <button type="button" className={`${styles.secondaryButton} type-button`} onClick={resetRound}>
          {actions.reset}
        </button>
      </div>

      {!isRoundActive && !isRoundComplete ? (
        <div className={styles.startCard}>
          <p className={`type-body-md ${styles.hint}`}>{content.game.submitHint}</p>
          <div className={styles.difficultyCard}>
            <p className={`type-label ${styles.difficultyLabel}`}>{content.game.difficultyLabel}</p>
            <div className={styles.difficultyRow}>
              {difficultyOrder.map((difficultyValue) => (
                <button
                  key={difficultyValue}
                  type="button"
                  className={`${styles.difficultyButton} ${difficulty === difficultyValue ? styles.difficultyButtonActive : ""} type-button`}
                  onClick={() => setDifficulty(difficultyValue)}
                >
                  {difficultyValue}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className={`${styles.primaryButton} type-button`} onClick={startRound}>
            {loadingRound ? content.game.loadingPlaces : actions.startRound}
          </button>
        </div>
      ) : null}

      {isRoundActive && currentQuestion ? (
        <>
          <div className={styles.questionCard}>
            <p className={`type-label ${styles.roundLabel}`}>
              {content.game.roundLabel} {currentQuestionIndex + 1} / {questions.length}
            </p>
            <h2 className={`type-heading-md ${styles.questionTitle}`}>
              {interpolate(content.game.instruction, { place: currentQuestion.place.name })}
            </h2>
          </div>

          <div ref={mapContainerRef} className={styles.map} />

          {feedback ? <p className={`type-body-md ${styles.feedback}`}>{feedback}</p> : null}
          {!hasSubmitted && preSubmitHint ? (
            <p className={`type-body-sm ${styles.hintText}`}>
              {content.game.preSubmitHintLabel} {preSubmitHint}
            </p>
          ) : null}
          {error ? <p className={`type-body-sm ${styles.error}`}>{error}</p> : null}

          {!hasSubmitted ? (
            <div className={styles.actionRow}>
              <button
                type="button"
                className={`${styles.secondaryButton} type-button`}
                onClick={clearPin}
                disabled={!guess}
              >
                {actions.clearPin}
              </button>
              <button type="button" className={`${styles.primaryButton} type-button`} onClick={submitPin}>
                {actions.submitPin}
              </button>
            </div>
          ) : (
            <button type="button" className={`${styles.primaryButton} type-button`} onClick={goNextQuestion}>
              {currentQuestionIndex === questions.length - 1 ? actions.finishRound : actions.nextQuestion}
            </button>
          )}
        </>
      ) : null}

      {isRoundComplete ? (
        <div className={styles.startCard}>
          <h2 className={`type-heading-md ${styles.questionTitle}`}>
            {interpolate(content.game.scoreResult, { score })}
          </h2>
          <button type="button" className={`${styles.primaryButton} type-button`} onClick={resetRound}>
            {actions.reset}
          </button>
        </div>
      ) : null}
    </section>
  );
}
