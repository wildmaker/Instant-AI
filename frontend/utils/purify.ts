import createDOMPurify from "dompurify";

const DOMPurify = typeof window !== 'undefined' ? createDOMPurify(window) : null;

export function sanitize(html: string): string {
  if (!DOMPurify) return html;
  
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'script'],
    FORBID_ATTR: ['style'],
  });
}