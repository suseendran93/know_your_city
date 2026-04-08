"use client";

import { AppNavigation } from "@/components/layout/AppNavigation/AppNavigation";
import { RequireAuth } from "@/components/layout/RequireAuth/RequireAuth";
import { useAppContext } from "@/components/providers/AppProvider/AppProvider";
import { RouteModeScreen } from "@/features/route-mode/components/RouteModeScreen/RouteModeScreen";
import { getMessages, interpolate } from "@/lib/i18n";

export default function RouteModePage() {
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
            ariaLabel={messages.routeMode.navigation.label}
          />
        </div>
        <RouteModeScreen
          cityName={cityName}
          content={{
            ...messages.routeMode,
            header: {
              ...messages.routeMode.header,
              subtitle: interpolate(messages.routeMode.header.subtitle, { city: cityName })
            },
            search: {
              ...messages.routeMode.search,
              placeholder: interpolate(messages.routeMode.search.placeholder, { city: cityName })
            }
          }}
          actions={messages.common.actions}
          status={messages.common.status}
        />
      </main>
    </RequireAuth>
  );
}
