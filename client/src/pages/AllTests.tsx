import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestResultCard } from "@/components/TestResultCard";
import { statisticalTests, categoryGroups } from "@/lib/statsData";
import { Search, BarChart3, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AllTests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMethodFamily, setSelectedMethodFamily] = useState<string | null>(null);

  const methodFamilies = useMemo(() => {
    return Array.from(new Set(statisticalTests.map(t => t.methodFamily))).sort();
  }, []);

  const filteredCategories = useMemo(() => {
    if (selectedMethodFamily === null) {
      return categoryGroups;
    }
    const testsForMethod = statisticalTests.filter(t => t.methodFamily === selectedMethodFamily);
    const categoryIdsWithMethod = new Set<string>();
    testsForMethod.forEach(test => {
      categoryGroups.forEach(group => {
        if (group.tests.includes(test.id)) {
          categoryIdsWithMethod.add(group.id);
        }
      });
    });
    return categoryGroups.filter(g => categoryIdsWithMethod.has(g.id));
  }, [selectedMethodFamily]);

  useEffect(() => {
    if (selectedCategory !== null && !filteredCategories.some(c => c.id === selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [filteredCategories, selectedCategory]);

  const filteredTests = statisticalTests.filter((test) => {
    const matchesSearch =
      searchQuery === "" ||
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.methodFamily.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      categoryGroups.find(g => g.id === selectedCategory)?.tests.includes(test.id);
    
    const matchesMethodFamily = selectedMethodFamily === null ||
      test.methodFamily === selectedMethodFamily;
    
    return matchesSearch && matchesCategory && matchesMethodFamily;
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
              Browse our complete library of {statisticalTests.length} statistical tests and their use cases.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
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
              <Select
                value={selectedMethodFamily ?? "all"}
                onValueChange={(value) => setSelectedMethodFamily(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-48" data-testid="select-method-family">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Method Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {methodFamilies.map((family) => (
                    <SelectItem key={family} value={family}>
                      {family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="filter-all"
              >
                All Categories
              </Button>
              {filteredCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`filter-${category.id}`}
                >
                  {category.label}
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
