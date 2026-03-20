import type { Metadata } from "next";
import { Cinzel, Lato } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Madam Groovy | Chat with Harmony",
  description: "Get clarity now. Chat with Madam Groovy for psychic readings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${cinzel.variable} ${lato.variable} h-full antialiased`}>
        <div className="stars" id="stars" />
        {children}
      </body>
    </html>
  );
}
