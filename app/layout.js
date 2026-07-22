import { Sora, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import ThemeProvider from "@/components/shell/ThemeProvider";
import AppSidebar from "@/components/shell/AppSidebar";
import Header from "@/components/shell/Header";
import Footer from "@/components/shell/Footer";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Claude Certified Architect — Exam Prep",
  description:
    "Study and practice-exam module for the Claude Certified Architect (Foundations) certification.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const sidebarCollapsed = cookieStore.get("sidebarCollapsed")?.value === "true";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-ink">
        <ThemeProvider>
          <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <AppSidebar defaultCollapsed={sidebarCollapsed} />
              <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-[1280px] p-6">{children}</div>
              </main>
            </div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
