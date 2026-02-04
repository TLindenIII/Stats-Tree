import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-r";
import { useEffect, useRef, useState } from "react";

// Import the theme CSS files as raw strings using Vite's ?url feature
import materialLightUrl from "prism-themes/themes/prism-material-light.css?url";
import materialDarkUrl from "prism-themes/themes/prism-material-dark.css?url";

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const ref = useRef<HTMLElement | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Initial check
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Inject the appropriate theme stylesheet
  useEffect(() => {
    const existingLink = document.getElementById("prism-theme") as HTMLLinkElement;
    const themeUrl = isDark ? materialDarkUrl : materialLightUrl;

    if (existingLink) {
      if (existingLink.href !== themeUrl) {
        existingLink.href = themeUrl;
      }
    } else {
      const link = document.createElement("link");
      link.id = "prism-theme";
      link.rel = "stylesheet";
      link.href = themeUrl;
      document.head.appendChild(link);
    }
  }, [isDark]);

  // Highlight code when it changes
  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current);
  }, [code, lang]);

  return (
    <pre className="p-3 rounded-md text-xs overflow-x-auto">
      <code ref={ref as any} className={`language-${lang}`}>
        {code}
      </code>
    </pre>
  );
}
