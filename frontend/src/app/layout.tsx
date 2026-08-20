import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nyaya Saathi — From Legal Confusion to Clear Action",
    template: "%s | Nyaya Saathi",
  },
  description:
    "AI-powered legal navigation platform for Indian citizens. Understand your rights, analyze evidence, and get step-by-step action plans — no legal jargon required.",
  keywords: [
    "legal aid",
    "AI legal navigator",
    "Indian law",
    "legal action plan",
    "Nyaya Saathi",
    "consumer rights",
    "legal document generator",
  ],
  authors: [{ name: "Nyaya Saathi Team" }],
  openGraph: {
    title: "Nyaya Saathi — From Legal Confusion to Clear Action",
    description:
      "AI-powered legal navigation for Indian citizens. Problem → Law → Evidence → Action.",
    type: "website",
    locale: "en_IN",
    siteName: "Nyaya Saathi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyaya Saathi — From Legal Confusion to Clear Action",
    description:
      "AI-powered legal navigation for Indian citizens. Problem → Law → Evidence → Action.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
