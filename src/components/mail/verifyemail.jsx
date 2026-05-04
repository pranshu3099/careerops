// app/verify-email/page.jsx
import { Mail, CheckCircle } from "lucide-react";

export default function VerifyEmailComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            CareerOps
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>

          {/* Main Message */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Check Your Email
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-800 text-left">
                The verification link will expire in <strong>15 minutes</strong>. 
                If you don&apos;t see the email, check your spam folder.
              </p>
            </div>
          </div>

          {/* Resend Link */}
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the email?{" "}
            <button className="text-gray-900 font-medium hover:underline focus:outline-none">
              Resend verification email
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact us at{" "}
          <a href="mailto:support@careerops.com" className="text-gray-900 hover:underline">
            support@careerops.com
          </a>
        </p>
      </div>
    </div>
  );
}
