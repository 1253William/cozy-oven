"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EditorialProductCard from "../components/EditorialProductCard";
import useCustomerProducts from "../hooks/useCustomerProducts";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const displayCategory = (category: string) => {
  if (category.trim().toLowerCase() === "package") return "Gifts and Flight Boxes";
  return category;
};

export default function ShopPage() {
  const { products, loading, error } = useCustomerProducts({ limit: 200 });
  const groups = products.reduce<Record<string, typeof products>>((acc, product) => {
    const category = displayCategory(product.productCategory || "Bakery");
    acc[category] = acc[category] || [];
    acc[category].push(product);
    return acc;
  }, {});
  const categories = Object.keys(groups).sort();

  return (
    <>
      <Navbar />
      <main className="editorial-shell">
        <section className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <h1 className="prototype-heading text-3xl sm:text-4xl">Shop fresh bakes by category.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5d6043] sm:mt-5 sm:text-lg sm:leading-8">
            Banana bread, creamy yoghurt, and gifts and flight boxes, grouped so you can browse with ease.
          </p>

          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-10">
              {categories.map((category) => (
                <a key={category} href={`#${slugify(category)}`} className="editorial-button-outline px-5 py-2 text-sm">
                  {category}
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          {loading && <div className="editorial-card p-10 text-center text-[#5d6043]">Loading products...</div>}
          {error && <div className="editorial-card p-10 text-center text-red-700">{error}</div>}

          {!loading && !error && (
            <div className="space-y-12 sm:space-y-20">
              {categories.map((category) => (
                <section key={category} id={slugify(category)} className="scroll-mt-28">
                  <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#b9aca2] pb-4 sm:mb-8 sm:flex-row sm:items-end sm:pb-5">
                    <div>
                      <h2 className="prototype-heading text-2xl sm:text-3xl">{category}</h2>
                    </div>
                    <p className="rounded-full bg-[#faf9f5] px-4 py-2 text-sm font-black text-[#5d6043] shadow-[inset_0_0_0_1px_rgba(34,34,34,0.09)]">{groups[category].length} items</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                    {groups[category].map((product) => (
                      <EditorialProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
