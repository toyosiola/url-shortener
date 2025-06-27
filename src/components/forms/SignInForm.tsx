"use client";

import React, { useActionState } from "react";
import SubmitButton from "./SubmitButton";
import { FormInput } from "./FormInput";
import { loginSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { toast } from "sonner";
import { signInAction } from "@/app/signin/serverAction";
import { FieldErrors } from "./SignUpForm";

type FormState = {
  data: z.infer<typeof loginSchema>;
  errors?: Omit<FieldErrors, "full_name" | "confirm_password">;
};

const initialState: FormState = { data: { email: "", password: "" } };

async function formAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // client side validation
  const validatedData = loginSchema.safeParse(rawData);

  if (!validatedData.success) {
    // if validation failed
    return {
      errors: validatedData.error.format(),
      data: rawData,
    };
  }

  try {
    // TODO: Send to server action
    const response = await signInAction(validatedData.data);

    // User will be redirected on successful sign-in. End of road here

    // If sign-in is not successful
    // If error is not validation error, show error toast.
    if (response.errors._errors?.[0]) toast.error(response.errors._errors[0]);
    return { errors: response.errors, data: response.data };
  } catch (error) {
    // if it's a next.js redirect response from server, means successful signin. return then, no need to call toast
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      return initialState;
    }

    toast.error("An error occurred. Please try again.");
    return { data: rawData };
  }
}

export default function SignInForm() {
  const [state, action, isPending] = useActionState(formAction, initialState);

  return (
    <form action={action} className="space-y-6">
      <FormInput
        name="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        autoComplete="email"
        defaultValue={state.data.email}
        errors={state.errors?.email}
      />
      <FormInput
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        defaultValue={state.data.password}
        errors={state.errors?.password}
      />
      <SubmitButton
        isPending={isPending}
        pendingText="Signing in..."
        defaultText="Sign in"
      />
    </form>
  );
}
