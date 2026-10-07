import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "up4it | Find someone to join",
  description: "Find someone who is up for the same activity at the same time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
