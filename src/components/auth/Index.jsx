import { handleManualLogin, handleSignup } from "@/lib/auth";
import { useState } from "react";
import ManualAuth from "./manualauth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [loginerror, setLoginError] = useState("");
  const [signuperror, setSignupError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const isLogin = mode === "login";
  const router = useRouter();
  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await handleManualLogin({ email, password });
      if(res?.success){
        router.push('/dashboard')
        toast.success("logged in successfully")
      }
      localStorage.setItem("accessToken", res?.data?.accessToken);
    } catch (err) {
      setIsLoginLoading(false);
      setLoginError(err.message);
    }
  };

  const handleuserSignup = async (name, email, password) => {
    try {
      const res = await handleSignup({ name, email, password });
      if (res?.success) {
        router.push("/verify-email");
      }
    } catch (err) {
      setIsLoading(false);
      setSignupError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CarrerOps</h1>
          <p className="text-gray-600 mt-2">
            Manage your job applications efficiently
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Mode Toggle */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                isLogin
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                !isLogin
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <ManualAuth
            isLogin={isLogin}
            handleLogin={handleLogin}
            loginerror={loginerror}
            signuperror={signuperror}
            handleuserSignup={handleuserSignup}
            isSignupLoading={isSignupLoading}
            setIsSignupLoading={setIsSignupLoading}
            isLoginLoading = {isLoginLoading}
            setIsLoginLoading = {setIsLoginLoading}
          />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Terms (Signup Only) */}
          {!isLogin && (
            <p className="mt-4 text-xs text-center text-gray-500">
              By signing up, you agree to our{" "}
              <button type="button" className="text-gray-700 hover:underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button type="button" className="text-gray-700 hover:underline">
                Privacy Policy
              </button>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(isLogin ? "signup" : "login")}
            className="text-gray-900 font-medium hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
