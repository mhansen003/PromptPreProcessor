import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptPreProcessor - AI Prompt Configuration Dashboard",
  description: "Configure and optimize AI prompts with precision controls",
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
