import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Know Your Chennai",
  description: "A simple mobile-first game to learn Chennai through directions, places, and maps."
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
