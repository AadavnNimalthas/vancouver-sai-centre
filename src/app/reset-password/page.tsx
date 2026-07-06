import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RequestResetForm } from "@/components/auth/PasswordResetForms";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Reset your password">
      <RequestResetForm demoMode={!isSupabaseConfigured} />
    </AuthCard>
  );
}
