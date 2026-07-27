import { Alert } from "@/components/alert";
import { DynamicTheme } from "@/components/dynamic-theme";
import { RegisterForm } from "@/components/register-form";
import { SignInWithIdp } from "@/components/sign-in-with-idp";
import { Translated } from "@/components/translated";
import { getServiceConfig } from "@/lib/service-url";
import {
  getActiveIdentityProviders,
  getBrandingSettings,
  getDefaultOrg,
  getLegalAndSupportSettings,
  getLoginSettings,
  getPasswordComplexitySettings,
} from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies, headers } from "next/headers";

/**
 * Contexte de parcours SimplyLoc.
 *
 * Zitadel ne relaie aucun paramètre custom jusqu'ici (seuls `requestId` et
 * `organization` survivent au redirect /oauth/v2/authorize → /register), donc
 * l'app transmet le contexte via un cookie posé sur le domaine parent partagé
 * (`.<domaine>`), lisible depuis `auth.<domaine>`.
 *
 * Sert uniquement à choisir un libellé de titre : aucune décision de sécurité
 * n'en dépend, une valeur forgée ne peut qu'afficher un autre texte.
 */
const FLOW_CONTEXT_COOKIE = "sl_flow_ctx";

async function getRegisterTitleKey(): Promise<"title" | "titleLogement"> {
  const flow = (await cookies()).get(FLOW_CONTEXT_COOKIE)?.value;
  return flow === "logement" ? "titleLogement" : "title";
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("register");
  return { title: t("title") };
}

export default async function Page(props: { searchParams: Promise<Record<string | number | symbol, string | undefined>> }) {
  const searchParams = await props.searchParams;

  let { firstname, lastname, email, organization, requestId } = searchParams;

  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);

  if (!organization) {
    const org: Organization | null = await getDefaultOrg({ serviceConfig });
    if (org) {
      organization = org.id;
    }
  }

  const legal = await getLegalAndSupportSettings({ serviceConfig, organization });
  const passwordComplexitySettings = await getPasswordComplexitySettings({ serviceConfig, organization });

  const branding = await getBrandingSettings({ serviceConfig, organization });

  const loginSettings = await getLoginSettings({ serviceConfig, organization });

  const identityProviders = await getActiveIdentityProviders({ serviceConfig, orgId: organization }).then((resp) => {
    return resp.identityProviders.filter((idp) => {
      return idp.options?.isAutoCreation || idp.options?.isCreationAllowed; // check if IDP allows to create account automatically or manual creation is allowed
    });
  });

  if (!loginSettings) {
    return (
      <DynamicTheme branding={branding}>
        <div className="flex flex-col space-y-4">
          <h1>
            <Translated i18nKey="title" namespace="register" />
          </h1>
          <Alert>
            <Translated i18nKey="unknownContext" namespace="error" />
          </Alert>
        </div>
        <div className="w-full"></div>
      </DynamicTheme>
    );
  }

  if (!loginSettings?.allowRegister && (!loginSettings.allowExternalIdp || identityProviders.length === 0)) {
    return (
      <DynamicTheme branding={branding}>
        <div className="flex flex-col space-y-4">
          <h1>
            <Translated i18nKey="disabled.title" namespace="register" />
          </h1>
          <p className="ztdl-p">
            <Translated i18nKey="disabled.description" namespace="register" />
          </p>
        </div>
        <div className="w-full"></div>
      </DynamicTheme>
    );
  }

  return (
    <DynamicTheme branding={branding}>
      <div className="flex flex-col space-y-4">
        <h1>
          <Translated i18nKey={await getRegisterTitleKey()} namespace="register" />
        </h1>
        <p className="ztdl-p">
          <Translated i18nKey="description" namespace="register" />
        </p>
      </div>

      <div className="w-full">
        {!organization && (
          <Alert>
            <Translated i18nKey="unknownContext" namespace="error" />
          </Alert>
        )}

        {legal && passwordComplexitySettings && organization && loginSettings.allowLocalAuthentication && (
          <RegisterForm
            idpCount={!loginSettings?.allowExternalIdp ? 0 : identityProviders.length}
            legal={legal}
            organization={organization}
            firstname={firstname}
            lastname={lastname}
            email={email}
            requestId={requestId}
            loginSettings={loginSettings}
          ></RegisterForm>
        )}

        {loginSettings?.allowExternalIdp && !!identityProviders.length && (
          <>
            <SignInWithIdp
              identityProviders={identityProviders}
              requestId={requestId}
              organization={organization}
            ></SignInWithIdp>
          </>
        )}
      </div>
    </DynamicTheme>
  );
}
