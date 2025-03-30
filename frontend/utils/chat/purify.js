import createDOMPurify from "dompurify";

const DOMPurify = typeof window !== 'undefined' ? createDOMPurify(window) : null;

if (DOMPurify) {
  DOMPurify.setConfig({
    ADD_ATTR: ["target", "rel"],
  });
}

export default DOMPurify;