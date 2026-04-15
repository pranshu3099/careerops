import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { emailRegex, nameRegex, passwordRules } from "@/validators/validation";

const SignupPage = ({ handleuserSignup, isSignupLoading, setIsSignupLoading }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showNameError, setShowNameError] = useState(false);

  // Add this state at the top with other states
  const [toastMessage, setToastMessage] = useState("");

  // Add the handleSubmit function
  const handleSubmit = () => {
    // Check each field in order and show toast for first empty/invalid field
    if (!name || !nameRegex.test(name)) {
      setToastMessage("Please enter a valid name");
      setShowNameError(true);
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    if (!email || !emailRegex.test(email)) {
      setToastMessage("Please enter a valid email address");
      setShowEmailError(true);
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    if (!password || !passwordRules.every((rule) => rule.test(password))) {
      setToastMessage("Please enter a valid password");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    if (password !== confirmPassword) {
      setToastMessage("Passwords do not match");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    // All validations passed - proceed with signup
    else {
      setIsSignupLoading(true);
      handleuserSignup(name, email, password);
    }
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-3 rounded-md shadow-lg z-50 flex items-center animate-slide-down">
          <X className="w-4 h-4 mr-2" />
          {toastMessage}
        </div>
      )}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setShowNameError(true)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder="John Doe"
        />
        {showNameError && !nameRegex.test(name) && name.length > 0 && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <X className="w-3 h-3 mr-1" />
            Name must be at least 2 characters and contain only letters
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setShowEmailError(true)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder="you@example.com"
        />
      </div>

      {showEmailError && !emailRegex.test(email) && email.length > 0 && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <X className="w-3 h-3 mr-1" />
          Please enter a valid email address
        </p>
      )}

      <div className="relative">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setShowPasswordRules(true)}
          onBlur={() => setTimeout(() => setShowPasswordRules(false), 200)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder="••••••••"
        />
        {/* Password Rules Tooltip */}
        {showPasswordRules && (
          <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-200 rounded-md shadow-lg w-full">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Password must contain:
            </p>
            <ul className="space-y-1.5">
              {passwordRules.map((rule) => {
                const isValid = rule.test(password);
                return (
                  <li key={rule.id} className="flex items-center text-xs">
                    {isValid ? (
                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                    )}
                    <span
                      className={isValid ? "text-green-700" : "text-gray-600"}
                    >
                      {rule.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder="••••••••"
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <X className="w-3 h-3 mr-1" />
            Passwords do not match
          </p>
        )}
      </div>

      {isSignupLoading ? (
        <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2.5 px-4 rounded-md font-medium flex items-center justify-center cursor-wait shadow-md">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="tracking-wide animate-pulse">
              Creating your account
            </span>
            <span className="flex space-x-1">
              <span
                className="w-1 h-1 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-1 h-1 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-1 h-1 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          type="button"
          className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
        >
          Create Account
        </button>
      )}
    </>
  );
};

export default SignupPage;
