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
                <BackgroundWrapper className="bg-white dark:bg-[#171717] relative flex min-h-screen flex-col justify-center">
                  <div className="relative mx-auto w-full max-w-[440px] py-8">
                    <Skeleton>
                      <div className="h-40"></div>
                    </Skeleton>
                  </div>
                </BackgroundWrapper>
              }
            >
              <LanguageProvider>
                <BackgroundWrapper className="relative flex min-h-screen flex-col bg-white dark:bg-[#171717] md:flex-row">
                  {/* Left column: header + form */}
                  <div className="flex min-h-screen w-full flex-col md:w-1/2">
                    <header className="flex w-full items-center justify-center px-6 pb-4 pt-16 md:px-10 md:pt-24">
                      <a href="https://simplyloc.fr" className="inline-flex items-center">
                        <img
                          src={`${basePath}/simplyloc/logo.png`}
                          alt="SimplyLoc"
                          height={88}
                          className="h-16 w-auto md:h-[5.5rem]"
                        />
                      </a>
                    </header>
                    <div className="flex flex-1 items-start justify-center px-4 pb-8 pt-2 md:px-8">
                      <div className="w-full max-w-[1100px]">{children}</div>
                    </div>
                  </div>

                  {/* Right column: hero image full height + glassmorphism card (hidden on mobile) */}
                  <div
                    className="relative hidden md:flex md:min-h-screen md:w-1/2 md:flex-shrink-0 md:items-center md:justify-center"
                    style={{
                      backgroundImage: `url(${basePath}/simplyloc/login_img.jpg)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div
                      className="mx-8 max-w-lg rounded-2xl border border-white/20 p-8 text-white shadow-2xl backdrop-blur-md"
                      style={{ backgroundColor: "rgba(43, 53, 71, 0.35)" }}
                    >
                      <h2 className="mb-6 text-3xl font-bold">Pourquoi choisir SimplyLoc&nbsp;?</h2>
                      <ul className="space-y-4 text-base opacity-90">
                        <li>Recevez vos réservations en direct et encaissez par carte bancaire.</li>
                        <li>Synchronisez vos calendriers Airbnb, Booking et autres, automatiquement.</li>
                        <li>Gérez vos tarifs, vos conditions et vos contrats de location.</li>
                        <li>Ajoutez vos suppléments, frais de ménage et options voyageurs.</li>
                        <li>Gagnez du temps avec un outil guidé, simple et pensé pour les propriétaires.</li>
                      </ul>
                      <p className="mt-6 text-base font-semibold">
                        Avec SimplyLoc, créez dès aujourd&apos;hui le canal de réservation de demain.
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
