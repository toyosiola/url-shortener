"use client";

import React, { useActionState } from "react";
import SubmitButton from "./SubmitButton";
import { FormInput } from "./FormInput";
import { z } from "zod";
import { toast } from "sonner";
import { urlShortenSchema } from "@/lib/zodSchemas";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type FormState = {
  data: z.infer<typeof urlShortenSchema>;
  errors?: {
    url?: { _errors: string[] };
    _errors: string[];
  };
};

const initialState: FormState = {
  data: { url: "" },
};

async function formAction(
  router: AppRouterInstance,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawData = { url: formData.get("url") as string };

  // Client side validation
  const validatedData = urlShortenSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      errors: validatedData.error.format(),
      data: rawData,
    };
  }

  try {
    // Send to API endpoint
    const response = await fetch("/api/urls/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData.data),
    });

    const result = await response.json();

    if (response.ok) {
      // Success
      toast.success("URL shortened successfully!");
      router.refresh(); // refresh the page to show the new entry
      return initialState; // Reset form
    } else {
      // If user is not authenticated, redirect to siginin page
      if (response.status === 401) {
        router.push("/signin");
        return initialState;
      }

      // Error from API
      if (result.errors?._errors?.[0]) toast.error(result.errors._errors[0]);
      return { errors: result.errors, data: rawData };
    }
  } catch {
    toast.error("An error occurred. Please try again.");
    return { data: rawData };
  }
}

export default function UrlShortenForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    formAction.bind(null, router),
    initialState,
  );

  return (
    <form
      action={action}
      className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="grow">
        <FormInput
          name="url"
          type="url"
          className="mt-0"
          placeholder="https://example.com/very-long-url-that-needs-shortening"
          defaultValue={state.data.url}
          errors={state.errors?.url}
        />
      </div>

      <SubmitButton
        isPending={isPending}
        defaultText="Shorten URL"
        pendingText="Shortening..."
        className="mt-0 text-base sm:w-max"
      />
    </form>
  );
}
