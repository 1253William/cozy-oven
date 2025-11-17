import Footer from "./components/Footer";
// import Newsletter from "./components/Newsletter";
import BestSellers from "./components/BestSellers";
import Categories from "./components/Categories";
import Qualities from "./components/Qualities";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
    <Navbar />
      <main>
        <Hero />
        <Categories />
        <Qualities />
        <BestSellers />
      </main>
      <Footer />
    </>

  );
}
