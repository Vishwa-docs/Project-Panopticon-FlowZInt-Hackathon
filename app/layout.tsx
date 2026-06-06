import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Panopticon",
  description: "Zero-escalation support through adversarial multi-agent orchestration."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
