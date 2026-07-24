import HomeClient from "./components/HomeClient";
import {
  fallbackHomepageSections,
  fetchHomeCms,
  fetchHomeFaqs,
  fetchHomeProducts,
} from "./lib/homeData";

export default async function HomePage() {
  const [products, faqs, cms] = await Promise.all([
    fetchHomeProducts(),
    fetchHomeFaqs(),
    fetchHomeCms(),
  ]);

  const homepageSections =
    cms?.sections?.length ? cms.sections : fallbackHomepageSections();

  return (
    <HomeClient
      initialProducts={products}
      initialFaqs={faqs}
      initialHomepageSections={homepageSections}
    />
  );
}
