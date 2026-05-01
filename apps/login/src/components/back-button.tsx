"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonVariants } from "./button";
import { Translated } from "./translated";

export function BackButton({ href, ...props }: { href?: string; [key: string]: any }) {
  const router = useRouter();
  return (
    <Button onClick={() => (href ? router.push(href) : router.back())} type="button" variant={ButtonVariants.Secondary} {...props}>
      <Translated i18nKey="back" namespace="common" />
    </Button>
  );
}
