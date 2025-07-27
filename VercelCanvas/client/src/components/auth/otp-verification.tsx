import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

interface OtpVerificationProps {
  role: 'VENDOR' | 'PARTNER';
  onPhoneSubmit: (phone: string) => void;
  phoneNumber: string;
}

export default function OtpVerification({ role, onPhoneSubmit, phoneNumber }: OtpVerificationProps) {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState(phoneNumber);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(!!phoneNumber);
  const [name, setName] = useState('');

  const sendOtpMutation = useMutation({
    mutationFn: async ({ phone, role }: { phone: string; role: string }) => {
      const response = await apiRequest('POST', '/api/auth/send-otp', { phone, role });
      return response.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      onPhoneSubmit(phone);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp, role, name }: { phone: string; otp: string; role: string; name?: string }) => {
      const response = await apiRequest('POST', '/api/auth/verify-otp', { phone, otp, role, name });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user.needsApproval) {
        toast({
          title: "Application Pending",
          description: "Your partner application is pending approval.",
          variant: "destructive"
        });
        return;
      }

      login(data.user, data.token);
      toast({
        title: "Welcome!",
        description: `Successfully logged in as ${role.toLowerCase()}.`,
      });

      if (role === 'VENDOR') {
        setLocation('/vendor');
      } else {
        setLocation('/partner');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = () => {
    if (phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate({ phone, role });
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate({ phone, otp, role, name });
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verify Your Phone</h2>
        <p className="text-gray-600">
          {otpSent ? "Enter the OTP sent to your phone" : "Enter your mobile number to receive OTP"}
        </p>
      </div>

      <div className="space-y-4">
        {!otpSent ? (
          <>
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500">+91</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12"
                  maxLength={10}
                />
              </div>
            </div>

            {role === 'VENDOR' && (
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <Button
              onClick={handleSendOtp}
              disabled={sendOtpMutation.isPending}
              className="w-full"
            >
              {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={verifyOtpMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Continue"}
            </Button>

            <Button
              variant="outline"
              onClick={() => sendOtpMutation.mutate({ phone, role })}
              disabled={sendOtpMutation.isPending}
              className="w-full"
            >
              Resend OTP
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
