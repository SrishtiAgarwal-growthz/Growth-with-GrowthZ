import { Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp, resetPassword } from '../firebase/auth';
import image from "../assets/loginPage.png";
import CustomAlert from "../components/Alert";  // Import the CustomAlert component

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const showAlert = (message) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.companyName
        );
        showAlert('We have sent you a verification mail. Please verify your email before signing in.');
        setIsSignUp(false);
      } else {
        const user = await signIn(formData.email, formData.password);
        localStorage.setItem('loggedInUserId', user.uid);
        navigate('/genius');
      }
    } catch (error) {
      showAlert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      showAlert('Please enter your email address');
      return;
    }
    try {
      await resetPassword(formData.email);
      showAlert('Password reset link sent to your email');
    } catch (error) {
      showAlert(error.message || 'Error sending reset link');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 min-h-screen">
        <div className="flex min-h-screen items-center justify-center gap-20">
          <div className="hidden lg:flex lg:w-1/2 justify-end">
            <div className="relative w-[500px] h-[500px]">
              <div className="bg-gradient-to-br from-[#4865F4] to-[#FA828C] rounded-full w-32 h-32 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 blur-xl" />
              <div className="relative z-10">
                <img
                  src={image}
                  alt="Cloud Storage Illustration"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-[430px] space-y-3">
              <div className="mb-4 text-center">
                <span className="bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-transparent bg-clip-text">
                  Genius
                </span>
                <h1 className="text-3xl font-bold mb-2">
                  {isSignUp ? "Welcome to GrowthZ" : "Welcome back !"}
                </h1>
                <p className="text-gray-400">
                  Please enter your details to sign {isSignUp ? "up" : "in"}.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp ? (
                  <>
                    <div>
                      <label htmlFor="fullName" className="block text-sm mb-2">Name</label>
                      <input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-[#1C1C1E] border-2 border-purple-400 focus:border-green-500 focus:outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="companyName" className="block text-sm mb-2">Company</label>
                      <input
                        id="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-[#1C1C1E] border-2 border-purple-400 focus:border-green-500 focus:outline-none"
                        placeholder="Enter your company"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm mb-2">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-[#1C1C1E] border-2 border-purple-400 focus:border-green-500 focus:outline-none"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm mb-2">Password</label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg bg-[#1C1C1E] border-2 border-purple-400 focus:border-green-500 focus:outline-none"
                          placeholder="Enter your password"
                        />
                        <Eye
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-300"
                          size={20}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="email" className="block text-sm mb-2">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-[#1C1C1E] border-2 border-purple-400 focus:border-green-500 focus:outline-none"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm mb-2">Password</label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg bg-[#1C1C1E] border-2 border-purple-400 focus:border-green-500 focus:outline-none"
                          placeholder="Enter your password"
                        />
                        <Eye
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-300"
                          size={20}
                        />
                      </div>
                      <div className="text-right mt-1">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-white hover:opacity-90 transition-opacity font-medium mt-6"
                >
                  Sign {isSignUp ? "Up" : "In"}
                </button>

                <div className="text-center text-sm text-gray-400 pt-4">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-transparent bg-clip-text hover:opacity-90 transition-opacity"
                  >
                    Sign {isSignUp ? "In" : "Up"}
                  </button>
                </div>
                <div className="text-center text-sm text-gray-400">
                  By creating an account, you agree to the{" "}
                  <a href="#" className="text-blue-500 hover:text-blue-400">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-500 hover:text-blue-400">
                    Privacy Policy
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Alert Component */}
      <CustomAlert
        isOpen={isAlertOpen}
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
      />
    </div>
  );
};

export default LoginPage;