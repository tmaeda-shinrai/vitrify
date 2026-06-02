"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { StepName } from "@/components/onboarding/steps/step-name";
import { StepPhoto } from "@/components/onboarding/steps/step-photo";
import { StepSlug } from "@/components/onboarding/steps/step-slug";
import { StepWhatsapp } from "@/components/onboarding/steps/step-whatsapp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface OnboardingData {
  fullName: string;
  whatsapp: string;
  googleAvatarUrl: string | null;
}

const TOTAL_STEPS = 4;

export function OnboardingWizard({
  data,
  initialStep,
}: {
  data: OnboardingData;
  initialStep: number;
}) {
  const t = useTranslations("onboarding");
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 1), TOTAL_STEPS));
  const [name, setName] = useState(data.fullName);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const stepMeta = [
    { title: t("nameTitle"), description: t("nameDescription") },
    { title: t("slugTitle"), description: t("slugDescription") },
    { title: t("whatsappTitle"), description: t("whatsappDescription") },
    { title: t("photoTitle"), description: t("photoDescription") },
  ][step - 1]!;

  return (
    <Card>
      <CardHeader>
        <div
          className="mb-3 flex items-center gap-1.5"
          aria-label={t("progress", { step, total: TOTAL_STEPS })}
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <CardTitle>{stepMeta.title}</CardTitle>
        <CardDescription>{stepMeta.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <StepName
            defaultValue={name}
            onDone={(value) => {
              setName(value);
              next();
            }}
          />
        )}
        {step === 2 && <StepSlug name={name} onDone={next} />}
        {step === 3 && <StepWhatsapp defaultValue={data.whatsapp} onDone={next} />}
        {step === 4 && <StepPhoto googleAvatarUrl={data.googleAvatarUrl} />}
      </CardContent>
    </Card>
  );
}
