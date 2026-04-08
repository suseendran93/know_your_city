import { getMessages } from "@/lib/i18n";
import { HomeHero } from "@/features/home/components/HomeHero/HomeHero";
import { ModeList } from "@/features/home/components/ModeList/ModeList";

export default function HomePage() {
  const messages = getMessages();

  return (
    <main>
      <HomeHero content={messages.home.hero} actions={messages.common.actions} />
      <ModeList content={messages.home.modes} />
    </main>
  );
}
