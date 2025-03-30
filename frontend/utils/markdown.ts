import { encode as HTMLEncode } from "he";
import markdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import "highlight.js/styles/github.css";
import { v4 } from "uuid";

const markdown = markdownIt({
  html: false,
  xhtmlOut: false,
  breaks: true,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (error) {
        console.error("Failed to highlight code block:", error);
      }
    }
    return (
      '<pre class="hljs"><code>' +
      HTMLEncode(str) +
      "</code></pre>"
    );
  },
});

// Add custom renderer for strong tags to handle theme colors
markdown.renderer.rules.strong_open = () => '<strong class="text-blue-700 dark:text-blue-400">';
markdown.renderer.rules.strong_close = () => "</strong>";

// Add custom renderer for links
markdown.renderer.rules.link_open = (tokens, idx) => {
  const token = tokens[idx];
  const href = token.attrs?.find((attr) => attr[0] === "href");
  return `<a href="${href?.[1]}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">`;
};

// Add custom renderer for images
markdown.renderer.rules.image = function (tokens, idx) {
  const token = tokens[idx];
  const srcIndex = token.attrIndex("src");
  if (srcIndex < 0) return '';
  
  const src = token.attrs[srcIndex][1];
  const alt = token.content || "";

  return `<div class="w-full max-w-[800px]"><img src="${src}" alt="${alt}" class="w-full h-auto rounded-md my-2" /></div>`;
};

export function renderMarkdown(text: string): string {
  if (!text) return "";
  
  // Generate unique IDs for code blocks to support syntax highlighting
  const textWithCodeIds = text.replace(
    /```(\w+)?\n([\s\S]*?)```/g, 
    (match, lang, code) => {
      const id = v4();
      return `<div id="${id}" class="code-block-wrapper">` +
             `\`\`\`${lang || ''}\n${code}\`\`\`` +
             `</div>`;
    }
  );
  
  return markdown.render(textWithCodeIds);
}