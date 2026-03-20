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
  openGraph: {
    title: "Madam Groovy | 3 Free Minutes",
    description: "Get clarity now. Chat with Madam Groovy for psychic readings. 3 free minutes!",
    type: "website",
    url: "https://madam-groovy-chat.vercel.app",
    siteName: "Madam Groovy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Madam Groovy | 3 Free Minutes",
    description: "Get clarity now. Chat with Madam Groovy for psychic readings.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌙</text></link>" />
      </head>
      <body className={`${cinzel.variable} ${lato.variable} h-full antialiased`}>
        <div className="stars" id="stars" />
        {children}
      </body>
    </html>
  );
}
