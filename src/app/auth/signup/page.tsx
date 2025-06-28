import SignUpForm from "@/components/forms/SignUpForm";

// TODO: Signed-in user should not be able to access this page
export default function SignupPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg space-y-8 rounded-xl bg-white p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Create your account
        </h2>
        <SignUpForm />
      </div>
    </main>
  );
}
