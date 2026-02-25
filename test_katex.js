const React = require('react');

// The issue is likely that we are replacing children of 'span' nodes which
// rehype-katex might be using to render the math elements.
// KaTeX creates a lot of span elements with classes like "katex" and "katex-html".
// If we recursively parse those and split by text, we might be destroying the KaTeX DOM structure.

// Let's create a script to inspect TextWithGlossary behavior.
