"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleBhajanFavorite } from "@/lib/actions";
import type { Bhajan } from "@/lib/types";

interface BhajanHistoryListProps {
  favorites: Bhajan[];
  recentlyUsed: Bhajan[];
  submitted: Bhajan[];
  favoriteIds: string[];
}

export function BhajanHistoryList({
  favorites: initialFavorites,
  recentlyUsed,
  submitted,
  favoriteIds: initialFavoriteIds,
}: BhajanHistoryListProps) {
  const [activeTab, setActiveTab] = useState<"fav" | "recent" | "suggest">("fav");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);
  const [pending, startTransition] = useTransition();

  function handleToggleFavorite(bhajanId: string) {
    startTransition(async () => {
      const res = await toggleBhajanFavorite(bhajanId);
      if (res.ok) {
        setFavoriteIds((prev) =>
          prev.includes(bhajanId) ? prev.filter((id) => id !== bhajanId) : [...prev, bhajanId]
        );
      }
    });
  }

  // Derived favorites based on interactive state
  const displayedFavorites = initialFavorites.filter(
    (b) => favoriteIds.includes(b.id)
  );

  let currentList: Bhajan[] = [];
  if (activeTab === "fav") {
    currentList = displayedFavorites;
  } else if (activeTab === "recent") {
    currentList = recentlyUsed;
  } else if (activeTab === "suggest") {
    currentList = submitted;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-line gap-6 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("fav")}
          className={`pb-3 transition-colors relative ${
            activeTab === "fav" ? "text-terra-deep border-b-2 border-terra" : "text-ink-faint hover:text-ink"
          }`}
        >
          My Favourites ({displayedFavorites.length})
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`pb-3 transition-colors relative ${
            activeTab === "recent" ? "text-terra-deep border-b-2 border-terra" : "text-ink-faint hover:text-ink"
          }`}
        >
          Recently Used ({recentlyUsed.length})
        </button>
        <button
          onClick={() => setActiveTab("suggest")}
          className={`pb-3 transition-colors relative ${
            activeTab === "suggest" ? "text-terra-deep border-b-2 border-terra" : "text-ink-faint hover:text-ink"
          }`}
        >
          My Suggestions ({submitted.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="py-12 text-center rounded-lg border border-dashed border-line bg-white-warm">
            <p className="text-sm text-ink-soft">
              {activeTab === "fav"
                ? "No favourite bhajans bookmarked yet. Heart bhajans in the library to save them here."
                : activeTab === "recent"
                ? "No past submissions found. When you sign up for bhajans, they will appear here."
                : "You haven't suggested any new bhajans to the library yet."}
            </p>
          </div>
        ) : (
          currentList.map((b) => {
            const isFaved = favoriteIds.includes(b.id);
            return (
              <div
                key={b.id}
                className="card p-4 sm:p-5 border-line bg-white-warm hover:shadow-soft transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <Link href={`/library/bhajans/${b.id}`} className="group inline-block">
                    <span className="font-display text-lg font-semibold text-ink group-hover:text-terra-deep transition-colors">
                      {b.title}
                    </span>
                    <span className="ml-2.5 inline-block text-[0.8rem] text-ink-faint">
                      ({b.category} · {b.language})
                    </span>
                  </Link>
                  <p className="truncate text-xs text-ink-soft mt-1 italic leading-relaxed max-w-xl">
                    {b.meaning}
                  </p>
                  {activeTab === "suggest" && (
                    <div className="mt-2.5">
                      <span
                        className={`inline-block text-[0.65rem] font-bold uppercase px-2 py-0.5 rounded border ${
                          b.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : b.status === "pending"
                            ? "bg-gold-soft/10 text-gold border-gold-soft"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {b.status === "approved"
                          ? "Approved"
                          : b.status === "pending"
                          ? "Pending Review"
                          : "Rejected / Archived"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => handleToggleFavorite(b.id)}
                    className="size-10 flex items-center justify-center rounded-full hover:bg-sand/30 transition-colors"
                    aria-label={isFaved ? "Remove from favorites" : "Add to favorites"}
                    disabled={pending}
                  >
                    <svg
                      className={`size-6 transition-transform hover:scale-110 ${
                        isFaved ? "fill-terra text-terra" : "fill-none text-ink-soft"
                      }`}
                      stroke="currentColor"
                      strokeWidth="1.75"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
