import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { emailRegex, nameRegex, passwordRules } from "@/validators/validation";

const SignupPage = ({ handleuserSignup, isSignupLoading, setIsSignupLoading }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [errors, setErrors] = useState({});

  const validateSignup = () => {
    const nextErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      nextErrors.name = "Name is required";
    } else if (!nameRegex.test(trimmedName)) {
      nextErrors.name =
        "Name must be at least 2 characters and contain only letters";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (!passwordRules.every((rule) => rule.test(password))) {
      nextErrors.password = "Password does not meet the requirements";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearFieldError = (field) => {
    if (!errors[field]) return;
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSignupLoading) return;
    if (!validateSignup()) return;

    setIsSignupLoading(true);
    handleuserSignup(name.trim(), email.trim(), password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("name");
          }}
          required
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.name
              ? "border-red-300 focus:ring-red-100"
              : "border-gray-300 focus:ring-gray-900"
          }`}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <X className="w-3 h-3 mr-1" />
            {errors.name}
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
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          required
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.email
              ? "border-red-300 focus:ring-red-100"
              : "border-gray-300 focus:ring-gray-900"
          }`}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <X className="w-3 h-3 mr-1" />
            {errors.email}
          </p>
        )}
      </div>

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
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
            clearFieldError("confirmPassword");
          }}
          onFocus={() => setShowPasswordRules(true)}
          onBlur={() => setTimeout(() => setShowPasswordRules(false), 200)}
          required
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.password
              ? "border-red-300 focus:ring-red-100"
              : "border-gray-300 focus:ring-gray-900"
          }`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <X className="w-3 h-3 mr-1" />
            {errors.password}
          </p>
        )}
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
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearFieldError("confirmPassword");
          }}
          required
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            errors.confirmPassword
              ? "border-red-300 focus:ring-red-100"
              : "border-gray-300 focus:ring-gray-900"
          }`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <X className="w-3 h-3 mr-1" />
            {errors.confirmPassword}
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
          type="submit"
          className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
        >
          Create Account
        </button>
      )}
    </form>
  );
};

export default SignupPage;
