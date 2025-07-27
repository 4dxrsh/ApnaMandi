import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import LoginForm from "../components/auth/login-form";
import RegisterForm from "../components/auth/register-form";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'VENDOR') {
        setLocation('/vendor');
      } else if (user.role === 'PARTNER' && user.status === 'APPROVED') {
        setLocation('/partner');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  return (
    <div className="min-h-screen auth-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="vendor-gradient px-6 py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.447.894L10 15.618l-4.553 1.276A1 1 0 014 16V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 2a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Apna Mandi</h1>
            <p className="text-blue-100">Street Food Vendor Marketplace</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {authMode === 'login' ? (
              <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
          
          {/* Partner Login Link */}
          <div className="px-6 pb-6">
            <div className="border-t border-gray-200 pt-4">
              <p className="text-center text-sm text-gray-600">
                Are you a procurement partner?{" "}
                <button
                  onClick={() => setLocation('/partner-login')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Partner Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
