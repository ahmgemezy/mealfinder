import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import SurpriseMeContent from "./SurpriseMeContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('SurpriseMe');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function SurpriseMePage() {
  return <SurpriseMeContent />;
}
