import Navbar from '../Components/Navbar/Navbar';
import Hero from '../Components/Hero/Hero';
import Services from '../Components/Services/Services';
import EstimatorBanner from '../Components/EstimatorBanner/EstimatorBanner';
import Footer from '../Components/Footer/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Services />
      <EstimatorBanner />
      <Footer />
    </main>
  );
}