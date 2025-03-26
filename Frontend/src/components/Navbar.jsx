import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import menuIcon from "../assets/Hamburger.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  // const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  // const [isProductClicked, setIsProductClicked] = useState(false);
  // const dropdownRef = useRef(null);
  // const [closeTimeout, setCloseTimeout] = useState(null);
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  // const handleProductClick = (e) => {
  //   e.preventDefault();
  //   setIsProductClicked(!isProductClicked);
  // };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 h-[5.125rem] md:h-[6rem] flex items-center transition-colors duration-300 ${
        hasScrolled ? "bg-black/60 backdrop-blur-xl" : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-[2rem] w-full h-full">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-[7.5rem] h-[2.015rem] md:w-[11.5625rem] md:h-[2.5rem]"
          />
        </button>

        {/* Desktop Menu */}
        {/* <div className="hidden custom-md:flex items-center space-x-[3.5rem]">
          <div className="flex space-x-[2rem] text-[1rem]">
          
            <div
              ref={dropdownRef}
              className="relative group"
              onMouseEnter={() => {
                if (closeTimeout) clearTimeout(closeTimeout);
                !isProductClicked && setIsProductDropdownOpen(true);
              }}
              onMouseLeave={() => {
                if (!isProductClicked) {
                  const timeout = setTimeout(() => {
                    setIsProductDropdownOpen(false);
                  }, 300); // 300ms delay before closing
                  setCloseTimeout(timeout);
                }
              }}
            >
              <a
                href="#products"
                onClick={handleProductClick}
                className={`text-white hover:text-blue-500 transition duration-300 flex items-center ${
                  isProductDropdownOpen || isProductClicked
                    ? "text-blue-500"
                    : ""
                }`}
              >
                Products
                <svg
                  className={`ml-2 w-4 h-4 transition-transform duration-200 ${
                    isProductDropdownOpen || isProductClicked
                      ? "rotate-180"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </a>

            
              <div
                className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg transition-all duration-200 ease-in-out transform ${
                  isProductDropdownOpen || isProductClicked
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="rounded-md bg-black shadow-xs">
                  <div className="py-1">
                    <a
                      href="#product1"
                      className="block px-4 py-2 text-sm font-bold text-blue-400 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Genius
                    </a>
                    <a
                      href="#product2"
                      className="block px-4 py-2 text-sm text-blue-400 font-bold hover:bg-gray-100 hover:text-gray-900"
                    >
                      Rainbow
                    </a>
                    <a
                      href="#product3"
                      className="block px-4 py-2 text-sm text-blue-400 font-bold hover:bg-gray-100 hover:text-gray-900"
                    >
                      Opus
                    </a>
                    <a
                      href="#product3"
                      className="block px-4 py-2 text-sm text-blue-400 font-bold hover:bg-gray-100 hover:text-gray-900"
                    >
                      Wildcard
                    </a>
                    <a
                      href="#product3"
                      className="block px-4 py-2 text-sm text-blue-400 font-bold hover:bg-gray-100 hover:text-gray-900"
                    >
                      Thrive
                    </a>
                    <a
                      href="#product3"
                      className="block px-4 py-2 text-sm text-blue-400 font-bold hover:bg-gray-100 hover:text-gray-900"
                    >
                      Hawkeye
                    </a>
                  </div>
                </div>
              </div>
            </div>

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
        className="relative overflow-hidden bg-transparent text-white px-6 py-2 rounded-full border-2 border-blue-500 transition-colors duration-300 group"
      >
        <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
          TRY ME
        </span>
        <div 
          className="absolute inset-0 bg-blue-500 transform origin-bottom-left -translate-x-full translate-y-full transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0"
        />
      </button>

        </div> */}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="custom-md:hidden flex items-center justify-center"
        >
          <img
            src={menuIcon}
            alt={isOpen ? "Close menu" : "Open menu"}
            className="w-[2rem] h-[2rem] object-contain"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {/* <div
        className={`md:hidden absolute top-[5.125rem] left-0 right-0 bg-black transition-all duration-300 ease-in-out ${
          isOpen ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-[2rem] py-[1rem] space-y-[1rem]">
        
          <div className="space-y-2">
            <button
              onClick={() => setIsProductClicked(!isProductClicked)}
              className="flex items-center justify-between w-full text-white hover:text-blue-500 py-[0.5rem]"
            >
              <span>Products</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isProductClicked ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`pl-4 space-y-2 transition-all duration-200 ${
                isProductClicked ? "block" : "hidden"
              }`}
            >
              <a
                href="#product1"
                className="block text-white hover:text-blue-500 py-1"
              >
                Product 1
              </a>
              <a
                href="#product2"
                className="block text-white hover:text-blue-500 py-1"
              >
                Product 2
              </a>
              <a
                href="#product3"
                className="block text-white hover:text-blue-500 py-1"
              >
                Product 3
              </a>
              <a
                href="#product2"
                className="block text-white hover:text-blue-500 py-1"
              >
                Product 2
              </a>
              <a
                href="#product2"
                className="block text-white hover:text-blue-500 py-1"
              >
                Product 2
              </a>
              <a
                href="#product2"
                className="block text-white hover:text-blue-500 py-1"
              >
                Product 2
              </a>
            </div>
          </div>

          <a
            href="#clients"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Clients
          </a>
          <a
            href="#partners"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Partners
          </a>
          <a
            href="#solutions"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Solutions
          </a>
          <a
            href="#resources"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Resources
          </a>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-transparent text-white px-[1.5rem] py-[0.5rem] rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-black transition duration-300"
          >
            TRY ME
          </button>
        </div>
      </div> */}
    </nav>
  );
};

export default Navbar;
