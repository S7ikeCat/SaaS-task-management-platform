import { RegisterForm } from "@/features/auth/ui/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Register</h1>
        <RegisterForm />
      </div>
    </main>
  );
}