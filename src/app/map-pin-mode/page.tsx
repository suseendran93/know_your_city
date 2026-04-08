"use client";

import { AppNavigation } from "@/components/layout/AppNavigation/AppNavigation";
import { RequireAuth } from "@/components/layout/RequireAuth/RequireAuth";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import { MapPinModeScreen } from "@/features/map-pin-mode/components/MapPinModeScreen/MapPinModeScreen";
import { getMessages, interpolate } from "@/lib/i18n";

export default function MapPinModePage() {
  const messages = getMessages();
  const { city } = useAppContext();
  const cityName = city ?? messages.common.cities.chennai;

  return (
    <RequireAuth>
      <main>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "1rem 1rem 0" }}>
          <AppNavigation
            homeLabel={messages.common.actions.home}
            backLabel={messages.common.actions.back}
            ariaLabel={messages.mapPinMode.navigation.label}
          />
        </div>
        <MapPinModeScreen
          cityName={cityName}
          content={{
            ...messages.mapPinMode,
            header: {
              ...messages.mapPinMode.header,
              subtitle: interpolate(messages.mapPinMode.header.subtitle, { city: cityName })
            },
            game: {
              ...messages.mapPinMode.game,
              instruction: interpolate(messages.mapPinMode.game.instruction, { city: cityName })
            },
            errors: {
              ...messages.mapPinMode.errors,
              noPlaces: interpolate(messages.mapPinMode.errors.noPlaces, { city: cityName })
            }
          }}
          actions={messages.common.actions}
        />
      </main>
    </RequireAuth>
  );
}
