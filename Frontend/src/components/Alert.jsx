import PropTypes from 'prop-types';

const CustomAlert = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred background with particles */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md overflow-hidden">
        {/* Decorative particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-purple-500 opacity-20"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-blue-500 opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-pink-500 opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-blue-400 opacity-20"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-purple-400 opacity-20"></div>
      </div>

      {/* Alert content */}
      <div className="relative bg-[#1C1C1E] border-2 border-purple-400 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <p className="text-white mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gradient-to-r from-[#FA828C] to-[#4865F4] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

CustomAlert.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

CustomAlert.defaultProps = {
  isOpen: false,
  message: '',
  onClose: () => {}
};

export default CustomAlert;