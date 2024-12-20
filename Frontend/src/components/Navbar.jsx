import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import menuIcon from "../assets/Hamburger.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 h-[82px] md:h-[96px] flex items-center transition-colors duration-300 ${
        hasScrolled
          ? "bg-black/60 backdrop-blur-xl" // When scrolled
          : "bg-black" // At the top (no scroll)
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 w-full h-full">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-[120px] h-[32.24px] md:w-[185px] md:h-[40px]"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-14">
          <div className="flex space-x-8 text-[16px]">
            <a
              href="#products"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Products
            </a>
            <a
              href="#clients"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Clients
            </a>
            <a
              href="#partners"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Partners
            </a>
            <a
              href="#solutions"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Solutions
            </a>
            <a
              href="#resources"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Resources
            </a>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-transparent text-white px-6 py-2 rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-black transition duration-300">
            TRY ME
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden flex items-center justify-center">
          <img
            src={menuIcon}
            alt={isOpen ? "Close menu" : "Open menu"}
            className="w-8 h-8 object-contain"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-[82px] left-0 right-0 bg-black transition-all duration-300 ease-in-out ${
          isOpen ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-8 py-4 space-y-4">
          <a
            href="#products"
            className="block text-white hover:text-blue-500 py-2"
          >
            Products
          </a>
          <a
            href="#clients"
            className="block text-white hover:text-blue-500 py-2"
          >
            Clients
          </a>
          <a
            href="#partners"
            className="block text-white hover:text-blue-500 py-2"
          >
            Partners
          </a>
          <a
            href="#solutions"
            className="block text-white hover:text-blue-500 py-2"
          >
            Solutions
          </a>
          <a
            href="#resources"
            className="block text-white hover:text-blue-500 py-2"
          >
            Resources
          </a>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-transparent text-white px-6 py-2 rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-black transition duration-300">
            TRY ME
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;