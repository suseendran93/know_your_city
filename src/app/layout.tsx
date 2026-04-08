import type { Metadata } from "next";
import { CitySelectionModal } from "@/components/layout/CitySelectionModal/CitySelectionModal";
import { AppProvider } from "@/components/providers/AppProvider/AppProvider";
import { getMessages } from "@/lib/i18n";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Know Your City",
  description: "Learn city directions, places, and routes."
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  const messages = getMessages();

  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
          <CitySelectionModal
            title={messages.common.cityModal.title}
            description={messages.common.cityModal.description}
            selectLabel={messages.common.cityModal.selectLabel}
            saveLabel={messages.common.cityModal.saveLabel}
            options={[
              { value: "Chennai", label: messages.common.cities.chennai },
              { value: "Bangalore", label: messages.common.cities.bangalore }
            ]}
          />
        </AppProvider>
      </body>
    </html>
  );
}
