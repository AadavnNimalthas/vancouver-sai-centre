import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create an account"
      subtitle="For registrations, volunteering, and member resources"
    >
      <SignupForm demoMode={!isSupabaseConfigured} />
    </AuthCard>
  );
}
