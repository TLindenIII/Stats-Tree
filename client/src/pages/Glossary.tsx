import { useState } from "react";
import { Search, DraftingCompass } from "lucide-react";
import { Link } from "@/lib/OfflineLink";
import { glossaryTerms } from "@/lib/glossaryData";
import { Input } from "@/components/ui/input";
import { NavLinks } from "@/components/NavLinks";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Glossary() {
  const [search, setSearch] = useState("");

  const filteredTerms = glossaryTerms
    .filter(
      (item) =>
        item.term.toLowerCase().includes(search.toLowerCase()) ||
        item.definition.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <DraftingCompass className="w-5 h-5 text-primary" />
            <span>StatsTree</span>
          </Link>
          <div className="flex items-center gap-4">
            <NavLinks currentPage="glossary" />
            <ThemeToggle />
          </div>
        </div>
      </header>

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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="border rounded-md divide-y bg-card">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((item) => (
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
      </main>
    </div>
  );
}
