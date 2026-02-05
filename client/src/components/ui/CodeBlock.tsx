import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-r";
import { useEffect, useRef, useState } from "react";

// Import the theme CSS files as raw strings using Vite's ?raw feature
import materialLightCss from "prism-themes/themes/prism-material-light.css?raw";
import materialDarkCss from "prism-themes/themes/prism-material-dark.css?raw";

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
    const existingStyle = document.getElementById("prism-theme") as HTMLStyleElement;
    const themeCss = isDark ? materialDarkCss : materialLightCss;

    if (existingStyle) {
      if (existingStyle.textContent !== themeCss) {
        existingStyle.textContent = themeCss;
      }
    } else {
      const style = document.createElement("style");
      style.id = "prism-theme";
      style.textContent = themeCss;
      document.head.appendChild(style);
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
