import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elvin Kakomo",
  description: "I help startups and SMEs ship real products. From idea to launch — web apps, mobile apps, and internal tools built fast, clean, and supported long-term.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
