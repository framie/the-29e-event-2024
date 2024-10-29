import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import 'animate.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "the chiwa event"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{'backgroundColor': '#282c34'}}>{children}</body>
    </html>
  );
}
