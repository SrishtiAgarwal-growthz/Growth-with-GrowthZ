import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Carousel from '../components/HomeSecond';
import Pricing from '../components/HomePricing';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="bg-black overflow-y-">
      <Navbar />
      <Hero />
      <Carousel />
      <Pricing />
     <Footer /> 
    </div>
  );
};

export default HomePage;