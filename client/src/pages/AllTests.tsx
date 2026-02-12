import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearch } from "wouter";
import { Link } from "@/lib/OfflineLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestResultCard } from "@/components/TestResultCard";
import { TestDetailSheet } from "@/components/TestDetailSheet";
import { CompareSheet } from "@/components/CompareSheet";
import { statisticalTests, categoryGroups, StatTest } from "@/lib/statsData";
import { Search, Route, X, GitCompare } from "lucide-react";
import { NavLinks } from "@/components/NavLinks";

// Smart search with weighted scoring and typo tolerance
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function scoreText(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return 0;
  
  // Exact match - highest score
  if (lowerText === lowerQuery) return 1000;
  
  // Starts with query - very high
  if (lowerText.startsWith(lowerQuery)) return 800;
  
  // Contains exact query phrase as substring - high priority for multi-word queries
  if (lowerText.includes(lowerQuery)) {
    // Bonus points based on query length (longer phrases = more specific = higher score)
    return 600 + Math.min(lowerQuery.length * 10, 200);
  }
  
  // Word-level matching
  const textWords = lowerText.split(/\s+/);
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  let wordScore = 0;
  let matchedWords = 0;
  
  for (const qWord of queryWords) {
    // Skip single-character words for individual scoring (but they count in phrase match above)
    if (qWord.length === 1) continue;
    
    let bestWordMatch = 0;
    for (const word of textWords) {
      // Exact word match
      if (word === qWord) { bestWordMatch = Math.max(bestWordMatch, 400); continue; }
      // Word starts with query word
      if (word.startsWith(qWord)) { bestWordMatch = Math.max(bestWordMatch, 300); continue; }
      // Word contains query word
      if (word.includes(qWord)) { bestWordMatch = Math.max(bestWordMatch, 200); continue; }
      // Fuzzy match with typo tolerance (for words 3+ chars)
      if (qWord.length >= 3 && word.length >= 3) {
        const distance = levenshteinDistance(word.slice(0, Math.max(qWord.length, 5)), qWord);
        const maxAllowedDistance = qWord.length <= 4 ? 1 : 2;
        if (distance <= maxAllowedDistance) {
          bestWordMatch = Math.max(bestWordMatch, 150 - distance * 30);
        }
      }
    }
    if (bestWordMatch > 0) matchedWords++;
    wordScore += bestWordMatch;
  }
  
  return wordScore;
}

function getSearchScore(test: StatTest, query: string): number {
  if (!query.trim()) return 1; // No query = show all equally
  
  // Field weights - name is most important
  const weights = {
    name: 10,
    description: 4,
    whenToUse: 3,
    assumptions: 2,
    category: 2,
    methodFamily: 2
  };
  
  let totalScore = 0;
  
  totalScore += scoreText(test.name, query) * weights.name;
  totalScore += scoreText(test.description, query) * weights.description;
  totalScore += scoreText(test.category, query) * weights.category;
  totalScore += scoreText(test.methodFamily, query) * weights.methodFamily;
  
  // Array fields - take best match
  const whenToUseScore = test.whenToUse.reduce((max, t) => Math.max(max, scoreText(t, query)), 0);
  totalScore += whenToUseScore * weights.whenToUse;
  
  const assumptionScore = test.assumptions.reduce((max, a) => Math.max(max, scoreText(a, query)), 0);
  totalScore += assumptionScore * weights.assumptions;
  
  
  return totalScore;
}

function matchesSearch(test: StatTest, query: string): boolean {
  return getSearchScore(test, query) > 0;
}

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AllTests() {
  const searchString = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMethodFamily, setSelectedMethodFamily] = useState<string | null>(null);
  const [selectedOutcomeScale, setSelectedOutcomeScale] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  const [selectedTest, setSelectedTest] = useState<StatTest | null>(null);
  const [compareTests, setCompareTests] = useState<StatTest[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Handle test query parameter to auto-open test detail
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const testId = params.get("test");
    if (testId) {
      const test = statisticalTests.find(t => t.id === testId);
      if (test) {
        setSelectedTest(test);
      }
    }
  }, [searchString]);

  const getFilteredTests = (excludeFilter?: string) => {
    return statisticalTests.filter((test) => {
      const searchMatches = excludeFilter === 'search' || matchesSearch(test, searchQuery);
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
      return searchMatches && matchesCategory && matchesMethodFamily && matchesOutcomeScale && matchesDesign && matchesLevel;
    });
  };

  const methodFamilies = useMemo(() => {
    const availableTests = getFilteredTests('methodFamily');
    return Array.from(new Set(availableTests.map(t => t.methodFamily))).sort();
  }, [searchQuery, selectedCategory, selectedOutcomeScale, selectedDesign, selectedLevel]);

  const outcomeScales = useMemo(() => {
    const availableTests = getFilteredTests('outcomeScale');
    return Array.from(new Set(availableTests.map(t => t.outcomeScale).filter(Boolean))).sort() as string[];
  }, [searchQuery, selectedCategory, selectedMethodFamily, selectedDesign, selectedLevel]);

  const designs = useMemo(() => {
    const availableTests = getFilteredTests('design');
    return Array.from(new Set(availableTests.map(t => t.design).filter(Boolean))).sort() as string[];
  }, [searchQuery, selectedCategory, selectedMethodFamily, selectedOutcomeScale, selectedLevel]);

  const levels = useMemo(() => {
    const order = ["basic", "intermediate", "advanced"];
    const availableTests = getFilteredTests('level');
    const unique = Array.from(new Set(availableTests.map(t => t.level).filter(Boolean))) as string[];
    return unique.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [searchQuery, selectedCategory, selectedMethodFamily, selectedOutcomeScale, selectedDesign]);

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
  }, [searchQuery, selectedMethodFamily, selectedOutcomeScale, selectedDesign, selectedLevel]);

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

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(12);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory, selectedMethodFamily, selectedOutcomeScale, selectedDesign, selectedLevel]);

  const filteredTests = useMemo(() => {
    const filtered = statisticalTests.filter((test) => {
      // Use query directly for filtering
      const searchMatches = matchesSearch(test, searchQuery);
      
      const matchesCat = selectedCategory === null || 
        categoryGroups.find(g => g.id === selectedCategory)?.tests.includes(test.id);
      
      const matchesMethodFamily = selectedMethodFamily === null ||
        test.methodFamily === selectedMethodFamily;
      
      const matchesOutcomeScale = selectedOutcomeScale === null ||
        test.outcomeScale === selectedOutcomeScale;
      
      const matchesDesign = selectedDesign === null ||
        test.design === selectedDesign;
      
      const matchesLevel = selectedLevel === null ||
        test.level === selectedLevel;
      
      return searchMatches && matchesCat && matchesMethodFamily && 
             matchesOutcomeScale && matchesDesign && matchesLevel;
    });
    
    // Sort by relevance when there's a search query
    if (searchQuery.trim()) {
      return filtered.sort((a, b) => getSearchScore(b, searchQuery) - getSearchScore(a, searchQuery));
    }
    
    return filtered;
  }, [searchQuery, selectedCategory, selectedMethodFamily, selectedOutcomeScale, selectedDesign, selectedLevel]);

  // Get visible tests for rendering
  const visibleTests = useMemo(() => {
    return filteredTests.slice(0, visibleCount);
  }, [filteredTests, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

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

  const toggleCompare = useCallback((test: StatTest) => {
    setCompareTests(prev => {
      if (prev.some(t => t.id === test.id)) {
        return prev.filter(t => t.id !== test.id);
      } else if (prev.length < 3) {
        return [...prev, test];
      }
      return prev;
    });
  }, []);

  const handleTestClick = useCallback((test: StatTest) => {
    setSelectedTest(test);
  }, []);

  const handleAlternativeClick = useCallback((altId: string) => {
    const altTest = statisticalTests.find(t => t.id === altId);
    if (altTest) {
      setSelectedTest(current => {
        if (current) {
          setCompareTests([current, altTest]);
        }
        return null; // Close detail sheet
      });
      setShowCompare(true);
    }
  }, []);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Route className="w-5 h-5 text-primary" />
            <span>StatsTree</span>
          </Link>
          <div className="flex items-center gap-2">
            <NavLinks currentPage="browse" />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCompareTests([])}
                data-testid="button-clear-compare"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setShowCompare(true)}
                data-testid="button-compare"
              >
                <GitCompare className="w-4 h-4 mr-1" />
                Compare ({compareTests.length})
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {visibleTests.length > 0 ? (
              <>
                {visibleTests.map((test) => (
                  <TestResultCard 
                    key={test.id} 
                    test={test}
                    onViewDetails={() => handleTestClick(test)}
                    onCompare={() => toggleCompare(test)}
                    isComparing={compareTests.some(t => t.id === test.id)}
                    canCompare={compareTests.length < 3 || compareTests.some(t => t.id === test.id)}
                    onAlternativeClick={(altId) => {
                      const altTest = statisticalTests.find(t => t.id === altId);
                      if (altTest) {
                        setCompareTests([test, altTest]);
                        setShowCompare(true);
                      }
                    }}
                  />
                ))}
                
                {visibleTests.length < filteredTests.length && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={handleLoadMore}>
                      Load More Tests ({filteredTests.length - visibleTests.length} remaining)
                    </Button>
                  </div>
                )}
              </>
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
            Showing {visibleTests.length} of {filteredTests.length} tests
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
        context="browse"
      />
    </div>
  );
}
