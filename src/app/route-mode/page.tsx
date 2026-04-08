import { AppNavigation } from "@/components/layout/AppNavigation/AppNavigation";
import { RouteModeScreen } from "@/features/route-mode/components/RouteModeScreen/RouteModeScreen";
import { getMessages } from "@/lib/i18n";

export default function RouteModePage() {
  const messages = getMessages();

  return (
    <main>
      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "1rem 1rem 0" }}>
        <AppNavigation
          homeLabel={messages.common.actions.home}
          backLabel={messages.common.actions.back}
          ariaLabel={messages.routeMode.navigation.label}
        />
      </div>
      <RouteModeScreen
        content={messages.routeMode}
        actions={messages.common.actions}
        status={messages.common.status}
      />
    </main>
  );
}
