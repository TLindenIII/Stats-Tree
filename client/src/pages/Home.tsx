import { Link } from "@/lib/OfflineLink";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Target, Layers, CheckSquare, Route, GitBranch, BookOpen, Network, Wand2 } from "lucide-react";
import { statisticalTests, categoryGroups } from "@/lib/statsData";

export default function Home() {
  const features = [
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Start with your research question and let us guide you to the right test",
    },
    {
      icon: GitBranch,
      title: "Decision Tree",
      description: "Navigate through data types, sample structures, and assumptions step by step",
    },
    {
      icon: CheckSquare,
      title: "Assumption Checking",
      description: "Understand what conditions your data needs to meet for each test",
    },
  ];

  const stats = [
    { value: String(statisticalTests.length), label: "Statistical Tests" },
    { value: String(categoryGroups.length), label: "Categories" },
    { value: "100%", label: "Free to Use" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Route className="w-5 h-5 text-primary" />
            <span>StatsTree</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/glossary" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Glossary
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Find the Right
              <span className="text-primary"> Statistical Test</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              An interactive guide to help researchers select the appropriate statistical test based on their research goals, data structure, and study design.
            </p>
            <div className="flex justify-center gap-4 pt-4 flex-wrap">
              <Button size="lg" asChild>
                <Link href="/wizard" data-testid="button-start-wizard">
                  <Wand2 className="mr-2 h-5 w-5" />
                  Start Selection Wizard
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/flowchart" data-testid="button-view-flowchart">
                  <Network className="mr-2 h-5 w-5" />
                  View Flowchart
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/tests" data-testid="button-browse-tests">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse All Tests
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Layers className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-2xl font-semibold">
              Covers Common Research Scenarios
            </h2>
            <p className="text-muted-foreground">
              From comparing group means to assessing relationships, from parametric to non-parametric methods,
              our decision tree covers the most common statistical analyses used in research.
            </p>
            <Button variant="outline" asChild>
              <Link href="/wizard" data-testid="button-get-started-footer">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>StatsTree - Statistical Selection Tool</p>
        </div>
      </footer>
    </div>
  );
}
