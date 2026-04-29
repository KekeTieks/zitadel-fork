import "@/styles/globals.scss";

import { BackgroundWrapper } from "@/components/background-wrapper";
import { LanguageProvider } from "@/components/language-provider";
import { Skeleton } from "@/components/skeleton";
import { ThemeProvider } from "@/components/theme-provider";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Lato } from "next/font/google";
import React, { Suspense } from "react";

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { title: t("title") };
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${lato.className}`} suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>
          <Tooltip.Provider>
            <Suspense
              fallback={
                <BackgroundWrapper className="bg-background-light-600 dark:bg-background-dark-600 relative flex min-h-screen flex-col justify-center">
                  <div className="relative mx-auto w-full max-w-[440px] py-8">
                    <Skeleton>
                      <div className="h-40"></div>
                    </Skeleton>
                  </div>
                </BackgroundWrapper>
              }
            >
              <LanguageProvider>
                <BackgroundWrapper className="bg-background-light-600 dark:bg-background-dark-600 relative flex min-h-screen flex-col">
                  {/* SimplyLoc header */}
                  <header className="flex w-full items-center px-6 py-4 md:px-10">
                    <a href="https://simplyloc.fr" className="inline-flex items-center">
                      <img
                        src={`${basePath}/simplyloc/logo.png`}
                        alt="SimplyLoc"
                        height={40}
                        className="h-10 w-auto"
                      />
                    </a>
                  </header>

                  {/* Split: form left, hero image right (hidden on mobile) */}
                  <div className="flex flex-1 flex-col md:flex-row">
                    <div className="flex flex-1 items-center justify-center px-4 py-8 md:px-8">
                      <div className="w-full max-w-[1100px]">{children}</div>
                    </div>
                    <div
                      className="hidden md:block md:w-1/2 md:flex-shrink-0"
                      style={{
                        backgroundImage: `url(${basePath}/simplyloc/hero.jpg)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      aria-hidden="true"
                    />
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
