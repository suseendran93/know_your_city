import { homeModes } from "@/data/homeModes";
import { HomeHero } from "@/features/home/components/HomeHero/HomeHero";
import { ModeList } from "@/features/home/components/ModeList/ModeList";

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <ModeList modes={homeModes} />
    </main>
  );
}
