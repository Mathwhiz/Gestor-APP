import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestor App",
  description: "Prototipo operativo para gestoria del automotor y agencia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-canvas)] text-[var(--color-ink)]">
        {children}
      </body>
    </html>
  );
}
