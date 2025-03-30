import katex from "katex";
import "katex/dist/katex.min.css";

// Default options
const defaultOptions = {
  throwOnError: false,
  displayMode: false,
  output: "html",
};

// Renders the Katex formula
function renderKatex(latex, options) {
  try {
    return katex.renderToString(latex, { ...defaultOptions, ...options });
  } catch (error) {
    if (options.throwOnError) {
      throw error;
    }
    return `<span class="katex-error" title="${error.toString()}">${latex}</span>`;
  }
}

// Define the plugin
export default function markdownItKatexPlugin(md) {
  // Inline mode: $...$ or \(...\)
  const inlineRegex = /(?<!\$)\$(?!\$)(.+?)\$(?!\$)|\\\\\\((.+?)\\\\\\)/g;
  
  // Block mode: $$...$$ or \[...\]
  const blockRegex = /\$\$([\s\S]+?)\$\$|\\\\\\[([\s\S]+?)\\\\\\]/g;

  // Inline renderer
  const renderInlineKatex = (tokens, idx) => {
    const content = tokens[idx].content;
    return renderKatex(content, { displayMode: false });
  };

  // Block renderer
  const renderBlockKatex = (tokens, idx) => {
    const content = tokens[idx].content;
    return `<div class="katex-block">${renderKatex(content, { displayMode: true })}</div>`;
  };

  // Add Katex rendering rules
  md.inline.ruler.push("katex_inline", (state) => {
    const pos = state.pos;
    const str = state.src;
    let match, token;

    // Reset regex state
    inlineRegex.lastIndex = pos;

    // Find inline Katex expressions
    if ((match = inlineRegex.exec(str)) !== null && match.index === pos) {
      const [fullMatch, formula1, formula2] = match;
      const formula = formula1 || formula2;
      
      token = state.push("katex_inline", "katex", 0);
      token.content = formula;
      
      state.pos += fullMatch.length;
      return true;
    }
    
    return false;
  });

  // Add block rule
  md.block.ruler.before("paragraph", "katex_block", (state, startLine, endLine) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const str = state.src.slice(pos);
    let match, token;

    // Reset regex state
    blockRegex.lastIndex = 0;

    // Find block Katex expressions
    if ((match = blockRegex.exec(str)) !== null && match.index === 0) {
      const [fullMatch, formula1, formula2] = match;
      const formula = formula1 || formula2;
      
      // Create token
      const token = state.push("katex_block", "katex", 0);
      token.block = true;
      token.content = formula;
      token.markup = fullMatch;
      
      // Skip lines
      const lineCount = fullMatch.split("\n").length - 1;
      state.line = startLine + lineCount + 1;
      
      return true;
    }
    
    return false;
  });

  // Register renderers
  md.renderer.rules.katex_inline = renderInlineKatex;
  md.renderer.rules.katex_block = renderBlockKatex;
};