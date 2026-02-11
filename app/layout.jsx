import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.fktr.cz"),
  title: {
    default: "FKTR – fakturuj v klidu",
    template: "%s | FKTR",
  },
  description:
    "Minimalistická appka pro vystavení faktur. Méně kliků, více klidu.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FKTR – fakturuj v klidu",
    description:
      "Minimalistická appka pro vystavení faktur. Méně kliků, více klidu.",
    url: "https://www.fktr.cz",
    siteName: "FKTR",
    locale: "cs_CZ",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "FKTR – fakturuj v klidu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FKTR – fakturuj v klidu",
    description:
      "Minimalistická appka pro vystavení faktur. Méně kliků, více klidu.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
