import { getMessages } from "@/lib/i18n";
import { AppNavigation } from "@/components/layout/AppNavigation/AppNavigation";
import { DirectionModeScreen } from "@/features/direction-mode/components/DirectionModeScreen/DirectionModeScreen";

export default function DirectionModePage() {
  const messages = getMessages();

  return (
    <main>
      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "1rem 1rem 0" }}>
        <AppNavigation
          homeLabel={messages.common.actions.home}
          backLabel={messages.common.actions.back}
          ariaLabel={messages.directionMode.navigation.label}
        />
      </div>
      <DirectionModeScreen content={messages.directionMode} actions={messages.common.actions} status={messages.common.status} />
    </main>
  );
}
