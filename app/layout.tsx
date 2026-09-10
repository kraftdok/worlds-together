import type { Metadata } from "next";
import "./globals.css";
import "./encounter.css";
import "./studio.css";
import "./orbit-creation.css";
import "./experience-entry.css";
import "./living-scene.css";

export const metadata: Metadata = {
  title: "Worlds Together — what becomes possible",
  description: "Bring your world. Discover what becomes possible together.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
