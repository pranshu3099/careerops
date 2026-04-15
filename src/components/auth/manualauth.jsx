import LoginPage from "./login";
import SignupPage from "./signup";

const ManualAuth = ({
  isLogin,
  handleLogin,
  loginerror,
  signuperror,
  handleuserSignup,
  isSignupLoading,
  setIsSignupLoading,
  isLoginLoading,
  setIsLoginLoading,
}) => {
  return (
    <div className="space-y-4">
      {isLogin ? (
        <LoginPage
          handleLogin={handleLogin}
          isLoginLoading={isLoginLoading}
          setIsLoginLoading={setIsLoginLoading}
        />
      ) : (
        <SignupPage
          handleuserSignup={handleuserSignup}
          isSignupLoading={isSignupLoading}
          setIsSignupLoading={setIsSignupLoading}
        />
      )}
      {isLogin && (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Forgot password?
          </button>
        </div>
      )}
      <p className="text-red-500 justify-center flex">
        {isLogin ? loginerror : signuperror}
      </p>
    </div>
  );
};

export default ManualAuth;
