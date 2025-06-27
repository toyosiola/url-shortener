"use client";

import React, { useActionState } from "react";
import SubmitButton from "./SubmitButton";
import { FormInput } from "./FormInput";
import { signUpSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { toast } from "sonner";
import { signUpAction } from "@/app/signup/serverAction";
import { useSearchParams } from "next/navigation";
import { ExclamationOctagon } from "../icons";

// formatted zod error structure
export type FieldErrors = {
  full_name?: { _errors: string[] };
  email?: { _errors: string[] };
  password?: { _errors: string[] };
  confirm_password?: { _errors: string[] };
  _errors: string[];
};

type FormState = {
  data: z.infer<typeof signUpSchema>;
  errors?: FieldErrors;
};

const initialState: FormState = {
  data: {
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  },
};

async function formAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawData = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // client side validation
  const validatedData = signUpSchema.safeParse(rawData);

  if (!validatedData.success) {
    // if validation failed
    return {
      errors: validatedData.error.format(),
      data: rawData,
    };
  }

  try {
    // Send to server action
    const response = await signUpAction(validatedData.data);

    // If success, return initial state to reset form
    if (response.success) {
      toast.success(response.message);
      return initialState;
    }

    // If error is not validation error, show error message
    if (response.errors._errors[0]) toast.error(response.errors._errors[0]);
    // return form data to persist user provided data in the form
    return { errors: response.errors, data: response.data };
  } catch {
    // unexpected error. Maybe network or anything
    toast.error("An error occurred. Please try again.");
    return { data: rawData };
  }
}

export default function SignUpForm() {
  const [state, action, isPending] = useActionState(formAction, initialState);
  // if error occured verifying user account. Expired or invalid verification token
  const errorMessage = useSearchParams().get("error");

  return (
    <form action={action} className="space-y-6">
      <FormInput
        name="full_name"
        type="text"
        label="Full Name"
        placeholder="Enter your full name"
        autoComplete="name"
        defaultValue={state.data.full_name} // to persist user provided data in the form if error occurs during form processing. React 19 clears form data by default.
        errors={state.errors?.full_name} // to show error message if validation fails
      />
      <FormInput
        name="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        autoComplete="email"
        defaultValue={state.data.email}
        errors={state.errors?.email}
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
        <div className="flex-1">
          <FormInput
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="new-password"
            defaultValue={state.data.password}
            errors={state.errors?.password}
          />
          {!state.errors?.password && (
            // info when there is no validation error yet. To be replaced by validation error if any for this field
            <small className="text-right text-xs text-[#626060] xl:text-left">
              8 characters minimum
            </small>
          )}
        </div>
        <FormInput
          name="confirm_password"
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          className="flex-1"
          defaultValue={state.data.confirm_password}
          errors={state.errors?.confirm_password}
        />
      </div>

      <div>
        <SubmitButton
          isPending={isPending}
          pendingText="Signing up..."
          defaultText="Sign up"
        />
        {errorMessage && (
          <p className="mt-4 flex items-center justify-center gap-2 rounded-sm bg-red-100 p-2 px-4 text-sm text-red-600">
            <ExclamationOctagon aria-hidden className="size-5" />
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}
