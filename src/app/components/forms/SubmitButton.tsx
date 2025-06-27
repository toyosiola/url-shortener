import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

interface SubmitButtonProps {
  isPending: boolean;
  pendingText: string;
  defaultText: string;
  className?: string;
}

export default function SubmitButton({
  isPending = false,
  pendingText = "Loading...",
  defaultText,
  className,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className={cn(
        "mt-6 flex w-full items-center justify-center rounded-lg bg-gray-800 px-6 py-4 text-lg font-semibold text-white shadow-md duration-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-400",
        className,
      )}
    >
      {isPending ? (
        <>
          <LoaderCircle className="mr-2 size-5 animate-spin" /> {pendingText}
        </>
      ) : (
        defaultText
      )}
    </button>
  );
}
