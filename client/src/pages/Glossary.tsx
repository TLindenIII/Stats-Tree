import { useState } from "react";
import { Search } from "lucide-react";
import { glossaryTerms } from "@/lib/glossaryData";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredTerms = glossaryTerms
    .filter(
      (item) =>
        item.term.toLowerCase().includes(search.toLowerCase()) ||
        item.definition.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.term.localeCompare(b.term));

  const totalPages = Math.ceil(filteredTerms.length / ITEMS_PER_PAGE);
  const paginatedTerms = filteredTerms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="glossary" />

      <main className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Statistical Glossary</h1>
          <p className="text-muted-foreground">{glossaryTerms.length} terms and definitions</p>
        </div>

        <div className="relative max-w-lg mx-auto w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>

        <div className="border rounded-md divide-y bg-card">
          {paginatedTerms.length > 0 ? (
            paginatedTerms.map((item) => (
              <div
                key={item.term}
                className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
              >
                <h3 className="font-semibold text-sm sm:w-[220px] shrink-0 text-foreground">
                  {item.term}
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {item.definition}
                  {item.relatedTerms && (
                    <div className="mt-1.5 text-xs">
                      <span className="font-medium text-muted-foreground/70">See also: </span>
                      <span className="text-primary/80">{item.relatedTerms.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No terms found matching "{search}"
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination className="cursor-pointer">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                // Show first, last, current, and +/- 1 from current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                // Show ellipsis if there's a gap
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
}
