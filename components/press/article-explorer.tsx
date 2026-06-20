"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { ListingItem } from "@/lib/press";

const PAGE_SIZE = 6;

type Sort = "newest" | "oldest";

export interface ArticleExplorerProps {
  items: ListingItem[];
  /** Empty-state copy when filters exclude everything. */
  emptyLabel?: string;
}

/** Distinct values preserving first-seen order. */
function distinct<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function ArticleExplorer({ items, emptyLabel = "No results match your filters." }: ArticleExplorerProps) {
  const categories = React.useMemo(
    () => distinct(items.map((i) => i.category)),
    [items],
  );
  const pubTypes = React.useMemo(
    () => distinct(items.map((i) => i.pubType)),
    [items],
  );
  const years = React.useMemo(
    () => distinct(items.map((i) => i.date.slice(0, 4))).sort((a, b) => (a < b ? 1 : -1)),
    [items],
  );

  const [selCats, setSelCats] = React.useState<string[]>([]);
  const [selTypes, setSelTypes] = React.useState<string[]>([]);
  const [year, setYear] = React.useState<string>("all");
  const [sort, setSort] = React.useState<Sort>("newest");
  const [page, setPage] = React.useState(1);

  // Any filter/sort change returns to the first page.
  const resetPage = () => setPage(1);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    resetPage();
  };

  const filtered = React.useMemo(() => {
    const out = items.filter((i) => {
      const catOk = selCats.length === 0 || selCats.includes(i.category);
      const typeOk = selTypes.length === 0 || selTypes.includes(i.pubType);
      const yearOk = year === "all" || i.date.slice(0, 4) === year;
      return catOk && typeOk && yearOk;
    });
    out.sort((a, b) => {
      if (a.date === b.date) return 0;
      const cmp = a.date < b.date ? -1 : 1;
      return sort === "newest" ? -cmp : cmp;
    });
    return out;
  }, [items, selCats, selTypes, year, sort]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = total === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const end = Math.min(current * PAGE_SIZE, total);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {total === 0 ? "No results" : `Showing ${start}–${end} of ${total} results`}
        </p>
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          Sort by:
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as Sort);
              resetPage();
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_16rem]">
        {/* List + pagination */}
        <div className="min-w-0">
          {pageItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
              {emptyLabel}
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {pageItems.map((item) => (
                <li key={item.id}>
                  <ArticleCard item={item} />
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 ? (
            <Pagination page={current} pageCount={pageCount} onChange={setPage} />
          ) : null}
        </div>

        {/* Filter sidebar */}
        <aside className="lg:order-last">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold text-foreground">Filter by</p>

            <FilterGroup
              title="Category"
              options={categories}
              selected={selCats}
              onAll={() => {
                setSelCats([]);
                resetPage();
              }}
              onToggle={(v) => toggle(selCats, setSelCats, v)}
            />

            <FilterGroup
              title="Publication type"
              options={pubTypes}
              selected={selTypes}
              onAll={() => {
                setSelTypes([]);
                resetPage();
              }}
              onToggle={(v) => toggle(selTypes, setSelTypes, v)}
            />

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink">
                Date
              </p>
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  resetPage();
                }}
                className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All time</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function FilterGroup({
  title,
  options,
  selected,
  onAll,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onAll: () => void;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5">
        <li>
          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <Checkbox checked={selected.length === 0} onCheckedChange={onAll} />
            All
          </label>
        </li>
        {options.map((opt) => (
          <li key={opt}>
            <label className="flex items-center gap-2.5 text-sm text-muted hover:text-foreground">
              <Checkbox
                checked={selected.includes(opt)}
                onCheckedChange={() => onToggle(opt)}
              />
              {opt}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ArticleCard({ item }: { item: ListingItem }) {
  // Coverage story: one card grouping all the outlets that covered the news.
  if (item.external && item.sources && item.sources.length > 0) {
    return (
      <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md sm:p-5">
        <div className="flex items-start gap-4 sm:gap-5">
          <Thumbnail
            image={item.image}
            badge={item.sources.length}
            fallback={<Newspaper aria-hidden className="size-6 text-primary" strokeWidth={1.75} />}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
              <span className="text-brand-ink">{item.category}</span>
              <span aria-hidden className="text-border">•</span>
              <time dateTime={item.date} className="text-muted">{item.dateLabel}</time>
            </div>
            <h3 className="mt-1.5 text-base font-semibold leading-snug text-foreground">
              <Link
                href={`/press/releases/${item.slug}`}
                className="rounded transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {item.title}
              </Link>
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </div>
        </div>

        {/* Outlet chips — the multiple websites that covered this story */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="text-xs font-medium text-muted">Covered by</span>
          {item.sources.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {s.label}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          ))}
        </div>
      </article>
    );
  }

  // Release: a single clickable card linking to the full story.
  const cardClass =
    "group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-5 sm:p-5";

  return (
    <Link href={item.href ?? "#"} className={cardClass}>
      <Thumbnail
        image={item.image}
        fallback={
          <span className="px-1 text-center font-display text-xs font-bold leading-tight tracking-tight text-foreground/70">
            {item.outlet ?? "BioAnalytiX"}
          </span>
        }
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
          <span className="text-brand-ink">{item.category}</span>
          <span aria-hidden className="text-border">•</span>
          <time dateTime={item.date} className="text-muted">{item.dateLabel}</time>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
          {item.description}
        </p>
      </div>
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors group-hover:border-primary/40 group-hover:bg-brand-soft group-hover:text-brand-ink">
        <ChevronRight aria-hidden className="size-4" />
      </span>
    </Link>
  );
}

/**
 * Consistent story thumbnail: a clean white, rounded tile that centers the logo
 * with `object-contain` and uniform padding (so wordmarks, square badges, and
 * photos all sit balanced). An optional count badge sits OUTSIDE the clipped
 * image area so it is never cut off.
 */
function Thumbnail({
  image,
  fallback,
  badge,
}: {
  image?: string;
  fallback: React.ReactNode;
  badge?: number;
}) {
  return (
    <span className="relative shrink-0">
      <span className="grid size-16 place-items-center overflow-hidden rounded-xl border border-border bg-white sm:size-20">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="max-h-[78%] max-w-[78%] object-contain"
          />
        ) : (
          fallback
        )}
      </span>
      {badge ? (
        <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-background bg-primary px-1.5 text-xs font-bold text-primary-foreground shadow-sm">
          {badge}
        </span>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  // Windowed page numbers with ellipses for long lists.
  const pages: (number | "…")[] = [];
  const add = (p: number) => pages.push(p);
  if (pageCount <= 7) {
    for (let p = 1; p <= pageCount; p++) add(p);
  } else {
    add(1);
    const lo = Math.max(2, page - 1);
    const hi = Math.min(pageCount - 1, page + 1);
    if (lo > 2) pages.push("…");
    for (let p = lo; p <= hi; p++) add(p);
    if (hi < pageCount - 1) pages.push("…");
    add(pageCount);
  }

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft aria-hidden className="size-4" />
        Previous
      </button>

      <ul className="flex items-center gap-1.5">
        {pages.map((p, i) =>
          p === "…" ? (
            <li key={`e${i}`} className="px-1 text-sm text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onChange(p)}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  p === page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-surface",
                )}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={btn}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
      >
        Next
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}

export default ArticleExplorer;
