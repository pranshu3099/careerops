import { useState } from "react";
import {Loader2 } from "lucide-react";

const LoginPage = ({ handleLogin, isLoginLoading, setIsLoginLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function handleUserLogin() {
    handleLogin(email, password);
    setIsLoginLoading(true)
  }
  return (
    <>
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
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder="you@example.com"
        />
      </div>

      <div>
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
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder="••••••••"
        />
      </div>

      {isLoginLoading ? (
        <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2.5 px-4 rounded-md font-medium flex items-center justify-center cursor-wait shadow-md">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="tracking-wide animate-pulse">
              Logging In
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
          type="button"
          onClick={handleUserLogin}
          className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
        >
          Login
        </button>
      )}
    </>
  );
};

export default LoginPage;
