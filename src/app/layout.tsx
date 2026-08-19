import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VE Colombia | Comunidad & Red Nacional de Movilidad Eléctrica",
  description:
    "Plataforma colaborativa para propietarios de vehículos eléctricos en Colombia. Rutas 3D con elevación, electrolineras verificadas, talleres especializados, manuales de alto voltaje y soporte comunitario.",
  keywords: [
    "vehículos eléctricos Colombia",
    "electrolineras Colombia",
    "carga EV Colombia",
    "talleres EV Colombia",
    "rutas carros electricos",
    "CCS2",
    "GB/T",
    "BYD Colombia",
    "Tesla Colombia",
    "Renault E-Tech"
  ],
};

import { AuthProvider } from "@/context/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${outfit.variable} ${jetbrains.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-emerald-500 selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
