import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "星际留言 · 沈佳乐",
  description: "分享想法，在星空中听见彼此。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
