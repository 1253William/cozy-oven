import Footer from "./components/Footer";
// import Newsletter from "./components/Newsletter";
import BestSellers from "./components/BestSellers";
import Categories from "./components/Categories";
import Qualities from "./components/Qualities";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import TestimonialsMarquee from "./components/TestimonialsMarquee";
import WelcomeModal from "./components/WelcomeModal";
import { testimonials } from "./data/testimonials";

export default function Home() {

  return (
    <>
    <Navbar />
      <main>
        <Hero />
        <Categories />
        <Qualities />
        <BestSellers />
        <TestimonialsMarquee testimonials={testimonials} speed={30} />
      </main>
      <Footer />
      <WelcomeModal />
    </>

  );
}
