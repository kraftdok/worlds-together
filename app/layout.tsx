import type { Metadata } from "next";
import "./globals.css";

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
