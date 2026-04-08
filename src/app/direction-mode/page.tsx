"use client";

import { getMessages } from "@/lib/i18n";
import { AppNavigation } from "@/components/layout/AppNavigation/AppNavigation";
import { RequireAuth } from "@/components/layout/RequireAuth/RequireAuth";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import { DirectionModeScreen } from "@/features/direction-mode/components/DirectionModeScreen/DirectionModeScreen";
import { interpolate } from "@/lib/i18n";

export default function DirectionModePage() {
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
            ariaLabel={messages.directionMode.navigation.label}
          />
        </div>
        <DirectionModeScreen
          cityName={cityName}
          content={{
            ...messages.directionMode,
            header: {
              ...messages.directionMode.header,
              subtitle: interpolate(messages.directionMode.header.subtitle, { city: cityName })
            },
            score: {
              ...messages.directionMode.score,
              roundCompleteDescription: interpolate(
                messages.directionMode.score.roundCompleteDescription,
                { city: cityName }
              )
            },
            search: {
              ...messages.directionMode.search,
              placeholder: interpolate(messages.directionMode.search.placeholder, { city: cityName })
            },
            errors: {
              ...messages.directionMode.errors,
              roundBuild: interpolate(messages.directionMode.errors.roundBuild, { city: cityName }),
              nearbyFailed: interpolate(messages.directionMode.errors.nearbyFailed, { city: cityName })
            }
          }}
          actions={messages.common.actions}
          status={messages.common.status}
        />
      </main>
    </RequireAuth>
  );
}
