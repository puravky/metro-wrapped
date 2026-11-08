import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultPanel } from "@/components/result-panel";
import { decodeResult } from "@/lib/result-payload";

type ResultPageProps = { params: Promise<{ payload: string }> };

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { payload } = await params;
  const result = decodeResult(payload);
  if (!result) return { title: "Metro Wrapped" };
  const image = `/api/card?result=${encodeURIComponent(payload)}&format=og`;

  return {
    title: `${result.archetype.name} | Metro Wrapped`,
    description: result.archetype.description,
    openGraph: { title: result.archetype.name, description: result.archetype.description, images: [image] },
    twitter: { card: "summary_large_image", title: result.archetype.name, description: result.archetype.description, images: [image] },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { payload } = await params;
  const result = decodeResult(payload);
  if (!result) notFound();

  return (
    <main className="shared-result-page">
      <ResultPanel result={result} />
      <footer className="site-footer compact-footer">
        <span>Unofficial. Not affiliated with DMRC.</span>
        <span>Route and fare figures are estimates.</span>
      </footer>
    </main>
  );
}
