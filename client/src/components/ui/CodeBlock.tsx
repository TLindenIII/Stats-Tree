import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-r";
import { useEffect, useRef, useState } from "react";

// Import all themes eagerly or lazy map?
// Vite glob import is best here
const themeModules = import.meta.glob("../../../../node_modules/prism-themes/themes/*.css", { query: "?raw", import: "default" });

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const ref = useRef<HTMLElement | null>(null);
  
  const [currentThemeName, setCurrentThemeName] = useState<string>("prism-one-light");
  
  useEffect(() => {
    const updateTheme = () => {
        const isDark = document.documentElement.classList.contains("dark");
        setCurrentThemeName(isDark ? "prism-material-dark" : "prism-one-light");
    };

    // Initial check
    updateTheme();

    // Watch for class changes on html element
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
                updateTheme();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true, 
        attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);


  // Inject the appropriate theme stylesheet
  useEffect(() => {
    const loadTheme = async () => {
        const themePath = `/node_modules/prism-themes/themes/${currentThemeName}.css`;
        // With glob import, keys are like: "/node_modules/prism-themes/themes/prism-a11y-dark.css"
        // But in Vite prod/dev, the key format might vary slightly (relative)
        // Let's match by filename suffix.
        
        // Match by end of string to be safe against relative/absolute path differences
        const keys = Object.keys(themeModules);
        const key = keys.find(k => k.endsWith(`/${currentThemeName}.css`));
        
        if (key && themeModules[key]) {
             const cssContent = await themeModules[key]() as string;
             
             let existingStyle = document.getElementById("prism-theme") as HTMLStyleElement;
             if (!existingStyle) {
                 existingStyle = document.createElement("style");
                 existingStyle.id = "prism-theme";
                 document.head.appendChild(existingStyle);
             }
             
             if (existingStyle.textContent !== cssContent) {
                 existingStyle.textContent = cssContent;
             }
        } else {
            console.warn(`Theme ${currentThemeName} not found`);
        }
    };
    loadTheme();
  }, [currentThemeName]);

  // Highlight code when it changes
  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current);
  }, [code, lang, currentThemeName]); // Re-highlight if theme changes (sometimes needed for layout calc)

  return (
    <pre className="p-3 rounded-md text-sm font-bold overflow-x-auto">
      <code ref={ref as any} className={`language-${lang}`}>
        {code}
      </code>
    </pre>
  );
}
