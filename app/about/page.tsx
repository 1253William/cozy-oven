import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CmsPageSectionsRenderer from "../components/cms/CmsPageSectionsRenderer";
import { fetchAboutCms, fallbackAboutSections } from "../lib/aboutData";
import { splitLeadingPromo } from "../lib/cmsSectionOrder";

export const metadata: Metadata = {
  title: "Our Story | Cozy Oven",
  description:
    "Meet Cozy Oven — warm, creative banana bread baking from Tema, crafted with comfort and care.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const about = await fetchAboutCms();
  const sections =
    about?.sections?.length ? about.sections : fallbackAboutSections();
  const { leadingPromo, rest } = splitLeadingPromo(sections);
  const bodySections = leadingPromo ? rest : sections;

  return (
    <>
      <Navbar />
      {leadingPromo ? (
        <CmsPageSectionsRenderer sections={[leadingPromo]} />
      ) : null}
      <main className="editorial-shell">
        <CmsPageSectionsRenderer sections={bodySections} />
      </main>
      <Footer />
    </>
  );
}
