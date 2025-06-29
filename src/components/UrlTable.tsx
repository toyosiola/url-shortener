"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";

const copyToClipboard = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!", { duration: 3000 });
  } catch {
    toast.error("Failed to copy URL", { duration: 3000 });
  }
};

export interface UrlData {
  id: string;
  short_slug: string;
  original_url: string;
  created_at: string;
}

export default function UrlTable({ urls }: { urls: UrlData[] }) {
  if (urls.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Your Shortened URLs
        </h2>
        <p className="text-gray-600">
          You haven&apos;t created any shortened URLs yet. Start by shortening
          your first URL above!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Your Shortened URLs
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Original URL
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Shortened URL
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Created
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {urls.map((url, index) => (
              <tr
                key={url.id}
                className={`border-b border-gray-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-4">
                  <a
                    href={url.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span className="max-w-xs truncate">
                      {url.original_url}
                    </span>
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </a>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/${url.short_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {url.short_slug}
                    </a>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/${url.short_slug}`,
                        )
                      }
                      className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </td>

                <td className="px-4 py-4 text-sm text-nowrap text-gray-600">
                  {formatDate(url.created_at)}
                </td>

                <td className="px-4 py-4">
                  <Link
                    href={`/analytics/${url.short_slug}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
