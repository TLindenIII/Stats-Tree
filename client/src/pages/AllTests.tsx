import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestResultCard } from "@/components/TestResultCard";
import { statisticalTests } from "@/lib/statsData";
import { Search, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AllTests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  const families = Array.from(new Set(statisticalTests.map((t) => t.methodFamily)));

  const filteredTests = statisticalTests.filter((test) => {
    const matchesSearch =
      searchQuery === "" ||
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFamily = selectedFamily === null || test.methodFamily === selectedFamily;
    return matchesSearch && matchesFamily;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>StatGuide</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wizard" data-testid="link-use-wizard">
                Use Wizard
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">All Statistical Tests</h1>
            <p className="text-muted-foreground">
              Browse our complete library of statistical tests and their use cases.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-tests"
              />
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              <Button
                variant={selectedFamily === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFamily(null)}
                data-testid="filter-all"
              >
                All
              </Button>
              {families.map((family) => (
                <Button
                  key={family}
                  variant={selectedFamily === family ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFamily(family)}
                  data-testid={`filter-${family.toLowerCase()}`}
                >
                  {family}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <TestResultCard key={test.id} test={test} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tests found matching your criteria.</p>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredTests.length} of {statisticalTests.length} tests
          </div>
        </div>
      </main>
    </div>
  );
}
