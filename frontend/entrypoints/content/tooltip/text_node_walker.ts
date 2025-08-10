const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'iframe', 'meta', 'input', 'textarea', 'svg']);

export function createTextNodeWalker(root: Node) {
  return document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-tooltipped]')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-enqueued]')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#footer')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#path')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#global')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#gnb')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#custom-logger-container')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#allMenuWrap')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#banking-helper-capture-modal')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#banking-helper-menu-finder-modal')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#banking-helper-toolbar')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#banking-helper-tooltip-bubble')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('#banking-helper-tooltip-result-modal')) return NodeFilter.FILTER_REJECT;
        const text = node.nodeValue?.trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    },
  );
}