import type { Metadata } from "next";
import { Landing } from "@/blocks/render";
import { getLanding } from "@/lib/content";
import { site } from "@/content/site";

export async function generateMetadata(): Promise<Metadata> {
  const { identity, seo } = (await getLanding()).data.root.props;
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: site.url,
      siteName: identity.name,
      locale: "es_MX",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  };
}

export default async function Home() {
  const { data, preview } = await getLanding();
  const { identity, contact, seo } = data.root.props;
  const hero = data.content.find((b) => b.type === "Hero")?.props;
  const education = data.content.find((b) => b.type === "Education")?.props;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.fullName,
    alternateName: identity.name,
    jobTitle: identity.role,
    description: seo.description,
    url: site.url,
    ...(contact.linkedin ? { sameAs: [contact.linkedin] } : {}),
    knowsAbout: identity.headline,
    alumniOf: [...new Set(education?.rows.map((r) => r.org) ?? [])],
  };

  return (
    <>
      {hero && (
        <>
          <link rel="preload" as="image" href={hero.imageA} media="(min-width: 768px)" />
          <link rel="preload" as="image" href={hero.imageAMobile} media="(max-width: 767px)" />
        </>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Landing data={data} />
      {preview && (
        <div className="preview-bar" role="status">
          Vista previa del borrador · <a href="/admin/preview?off">Salir</a> · <a href="/admin/editor">Volver al editor</a>
        </div>
      )}
    </>
  );
}
