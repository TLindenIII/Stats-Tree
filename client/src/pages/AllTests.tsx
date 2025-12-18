import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestResultCard } from "@/components/TestResultCard";
import { TestDetailSheet } from "@/components/TestDetailSheet";
import { CompareSheet } from "@/components/CompareSheet";
import { statisticalTests, categoryGroups, StatTest } from "@/lib/statsData";
import { Search, BarChart3, Filter, X, GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [selectedOutcomeScale, setSelectedOutcomeScale] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  const [selectedTest, setSelectedTest] = useState<StatTest | null>(null);
  const [compareTests, setCompareTests] = useState<StatTest[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const getFilteredTests = (excludeFilter?: string) => {
    return statisticalTests.filter((test) => {
      const matchesCategory = excludeFilter === 'category' || selectedCategory === null || 
        categoryGroups.find(g => g.id === selectedCategory)?.tests.includes(test.id);
      const matchesMethodFamily = excludeFilter === 'methodFamily' || selectedMethodFamily === null ||
        test.methodFamily === selectedMethodFamily;
      const matchesOutcomeScale = excludeFilter === 'outcomeScale' || selectedOutcomeScale === null ||
        test.outcomeScale === selectedOutcomeScale;
      const matchesDesign = excludeFilter === 'design' || selectedDesign === null ||
        test.design === selectedDesign;
      const matchesLevel = excludeFilter === 'level' || selectedLevel === null ||
        test.level === selectedLevel;
      return matchesCategory && matchesMethodFamily && matchesOutcomeScale && matchesDesign && matchesLevel;
    });
  };

  const methodFamilies = useMemo(() => {
    const availableTests = getFilteredTests('methodFamily');
    return Array.from(new Set(availableTests.map(t => t.methodFamily))).sort();
  }, [selectedCategory, selectedOutcomeScale, selectedDesign, selectedLevel]);

  const outcomeScales = useMemo(() => {
    const availableTests = getFilteredTests('outcomeScale');
    return Array.from(new Set(availableTests.map(t => t.outcomeScale).filter(Boolean))).sort() as string[];
  }, [selectedCategory, selectedMethodFamily, selectedDesign, selectedLevel]);

  const designs = useMemo(() => {
    const availableTests = getFilteredTests('design');
    return Array.from(new Set(availableTests.map(t => t.design).filter(Boolean))).sort() as string[];
  }, [selectedCategory, selectedMethodFamily, selectedOutcomeScale, selectedLevel]);

  const levels = useMemo(() => {
    const order = ["basic", "intermediate", "advanced"];
    const availableTests = getFilteredTests('level');
    const unique = Array.from(new Set(availableTests.map(t => t.level).filter(Boolean))) as string[];
    return unique.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [selectedCategory, selectedMethodFamily, selectedOutcomeScale, selectedDesign]);

  const filteredCategories = useMemo(() => {
    const availableTests = getFilteredTests('category');
    const categoryIdsWithTests = new Set<string>();
    availableTests.forEach(test => {
      categoryGroups.forEach(group => {
        if (group.tests.includes(test.id)) {
          categoryIdsWithTests.add(group.id);
        }
      });
    });
    return categoryGroups.filter(g => categoryIdsWithTests.has(g.id));
  }, [selectedMethodFamily, selectedOutcomeScale, selectedDesign, selectedLevel]);

  useEffect(() => {
    if (selectedCategory !== null && !filteredCategories.some(c => c.id === selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [filteredCategories, selectedCategory]);

  useEffect(() => {
    if (selectedMethodFamily !== null && !methodFamilies.includes(selectedMethodFamily)) {
      setSelectedMethodFamily(null);
    }
  }, [methodFamilies, selectedMethodFamily]);

  useEffect(() => {
    if (selectedOutcomeScale !== null && !outcomeScales.includes(selectedOutcomeScale)) {
      setSelectedOutcomeScale(null);
    }
  }, [outcomeScales, selectedOutcomeScale]);

  useEffect(() => {
    if (selectedDesign !== null && !designs.includes(selectedDesign)) {
      setSelectedDesign(null);
    }
  }, [designs, selectedDesign]);

  useEffect(() => {
    if (selectedLevel !== null && !levels.includes(selectedLevel)) {
      setSelectedLevel(null);
    }
  }, [levels, selectedLevel]);

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
    
    const matchesOutcomeScale = selectedOutcomeScale === null ||
      test.outcomeScale === selectedOutcomeScale;
    
    const matchesDesign = selectedDesign === null ||
      test.design === selectedDesign;
    
    const matchesLevel = selectedLevel === null ||
      test.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesMethodFamily && 
           matchesOutcomeScale && matchesDesign && matchesLevel;
  });

  const hasActiveFilters = selectedCategory !== null || selectedMethodFamily !== null ||
    selectedOutcomeScale !== null || selectedDesign !== null || selectedLevel !== null;

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedMethodFamily(null);
    setSelectedOutcomeScale(null);
    setSelectedDesign(null);
    setSelectedLevel(null);
    setSearchQuery("");
  };

  const toggleCompare = (test: StatTest) => {
    if (compareTests.some(t => t.id === test.id)) {
      setCompareTests(compareTests.filter(t => t.id !== test.id));
    } else if (compareTests.length < 3) {
      setCompareTests([...compareTests, test]);
    }
  };

  const handleTestClick = (test: StatTest) => {
    setSelectedTest(test);
  };

  const handleAlternativeClick = (testId: string) => {
    const test = statisticalTests.find(t => t.id === testId);
    if (test) {
      setSelectedTest(test);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>StatsTree</span>
          </Link>
          <div className="flex items-center gap-2">
            {compareTests.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCompare(true)}
                data-testid="button-compare"
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Compare ({compareTests.length})
              </Button>
            )}
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
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">All Statistical Tests</h1>
            <p className="text-muted-foreground">
              Browse our complete library of {statisticalTests.length} statistical tests and their use cases.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 max-w-4xl mx-auto flex-wrap justify-center">
              <div className="relative flex-1 min-w-[200px]">
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
                <SelectTrigger className="w-40" data-testid="select-method-family">
                  <SelectValue placeholder="Method" />
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
              <Select
                value={selectedOutcomeScale ?? "all"}
                onValueChange={(value) => setSelectedOutcomeScale(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-40" data-testid="select-outcome-scale">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  {outcomeScales.map((scale) => (
                    <SelectItem key={scale} value={scale}>
                      {scale}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedDesign ?? "all"}
                onValueChange={(value) => setSelectedDesign(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-44" data-testid="select-design">
                  <SelectValue placeholder="Design" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designs</SelectItem>
                  {designs.map((design) => (
                    <SelectItem key={design} value={design}>
                      {design}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedLevel ?? "all"}
                onValueChange={(value) => setSelectedLevel(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-36" data-testid="select-level">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
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

            {hasActiveFilters && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={clearAllFilters} data-testid="button-clear-filters">
                  <X className="w-4 h-4 mr-1" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>

          {compareTests.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Comparing:</span>
              {compareTests.map(test => (
                <Badge 
                  key={test.id} 
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleCompare(test)}
                  data-testid={`compare-badge-${test.id}`}
                >
                  {test.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
                <TestResultCard 
                  key={test.id} 
                  test={test}
                  onViewDetails={() => handleTestClick(test)}
                  onCompare={() => toggleCompare(test)}
                  isComparing={compareTests.some(t => t.id === test.id)}
                  canCompare={compareTests.length < 3 || compareTests.some(t => t.id === test.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tests found matching your criteria.</p>
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearAllFilters} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredTests.length} of {statisticalTests.length} tests
          </div>
        </div>
      </main>

      <TestDetailSheet 
        test={selectedTest}
        onClose={() => setSelectedTest(null)}
        onAlternativeClick={handleAlternativeClick}
      />

      <CompareSheet
        tests={compareTests}
        open={showCompare}
        onClose={() => setShowCompare(false)}
        onRemoveTest={(testId: string) => setCompareTests(compareTests.filter(t => t.id !== testId))}
      />
    </div>
  );
}
