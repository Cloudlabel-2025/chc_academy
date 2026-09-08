import type { Metadata, Viewport } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import AcademyGuide from "./academy-guide";

export const metadata: Metadata = {
  title: "CHC Oracle HCM Academy",
  description: "Structured, practice-led Oracle HCM training, configuration labs and trainee assignments.",
  openGraph: {
    title: "CHC Oracle HCM Academy",
    description: "Learn the design. Then configure.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CHC Oracle HCM Academy",
    description: "Structured Oracle HCM functional configuration training.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AcademyGuide />
      </body>
    </html>
  );
}
