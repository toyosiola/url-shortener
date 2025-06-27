import SignInForm from "@/components/forms/SignInForm";

export default function SigninPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg space-y-8 rounded-xl bg-white p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Sign in to your account
        </h2>
        <SignInForm />
      </div>
    </main>
  );
}
