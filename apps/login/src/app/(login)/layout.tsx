import "@/styles/globals.scss";

import { BackgroundWrapper } from "@/components/background-wrapper";
import { LanguageProvider } from "@/components/language-provider";
import { Skeleton } from "@/components/skeleton";
import { ThemeProvider } from "@/components/theme-provider";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Poppins } from "next/font/google";
import React, { Suspense } from "react";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { title: t("title") };
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${poppins.className}`} suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>
          <Tooltip.Provider>
            <Suspense
              fallback={
                <BackgroundWrapper className="bg-white relative flex min-h-screen flex-col justify-center">
                  <div className="relative mx-auto w-full max-w-[440px] py-8">
                    <Skeleton>
                      <div className="h-40"></div>
                    </Skeleton>
                  </div>
                </BackgroundWrapper>
              }
            >
              <LanguageProvider>
                <BackgroundWrapper className="relative flex min-h-screen flex-col bg-white md:flex-row">
                  {/* Left column: header + form */}
                  <div className="flex min-h-screen w-full flex-col md:w-1/2">
                    <header className="flex w-full items-center px-6 py-8 md:px-10">
                      <a href="https://simplyloc.fr" className="inline-flex items-center">
                        <img
                          src={`${basePath}/simplyloc/logo.png`}
                          alt="SimplyLoc"
                          height={40}
                          className="h-10 w-auto"
                        />
                      </a>
                    </header>
                    <div className="flex flex-1 items-center justify-center px-4 py-8 md:px-8">
                      <div className="w-full max-w-[1100px]">{children}</div>
                    </div>
                  </div>

                  {/* Right column: hero image full height + glassmorphism card (hidden on mobile) */}
                  <div
                    className="relative hidden md:flex md:min-h-screen md:w-1/2 md:flex-shrink-0 md:items-center md:justify-center"
                    style={{
                      backgroundImage: `url(${basePath}/simplyloc/hero.jpg)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div
                      className="mx-8 max-w-md rounded-2xl border border-white/20 p-8 text-white shadow-2xl backdrop-blur-md"
                      style={{ backgroundColor: "rgba(43, 53, 71, 0.35)" }}
                    >
                      <h2 className="mb-4 text-4xl font-bold">Pourquoi choisir SimplyLoc&nbsp;?</h2>
                      <p className="mb-4 text-lg font-semibold">La liberté de louer vos logements en direct</p>
                      <p className="text-base opacity-90">
                        Générez votre site de réservation, avec paiement CB et synchronisation de vos agendas.
                      </p>
                    </div>
                  </div>
                </BackgroundWrapper>
              </LanguageProvider>
            </Suspense>
          </Tooltip.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
