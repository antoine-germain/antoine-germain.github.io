(function () {
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderInline(text) {
    let out = escapeHtml(text);
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return out;
  }

  function parseMarkdown(md) {
    const lines = md.split(/\r?\n/);
    const html = [];
    let inList = false;
    let inDetails = false;

    const closeList = () => {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();

      if (trimmed.startsWith("<details")) {
        closeList();
        inDetails = true;
        html.push(trimmed);
        continue;
      }

      if (inDetails) {
        if (trimmed.startsWith("<summary") || trimmed.startsWith("</details")) {
          html.push(trimmed);
        } else if (trimmed) {
          html.push(`<p>${renderInline(trimmed)}</p>`);
        }
        if (trimmed.startsWith("</details")) inDetails = false;
        continue;
      }

      if (!trimmed) {
        closeList();
        continue;
      }

      if (trimmed.startsWith("## ")) {
        closeList();
        html.push(`<h2>${renderInline(trimmed.slice(3))}</h2>`);
        continue;
      }

      if (trimmed.startsWith("### ")) {
        closeList();
        const heading = trimmed.slice(4);
        const chunks = heading.split(" :: ");
        if (chunks.length === 2) {
          html.push(`<h3 class="paper-heading">${renderInline(chunks[0])}<span class="paper-inline-links">${renderInline(chunks[1])}</span></h3>`);
        } else {
          html.push(`<h3>${renderInline(heading)}</h3>`);
        }
        continue;
      }

      if (trimmed.startsWith("- ")) {
        if (!inList) {
          html.push("<ul>");
          inList = true;
        }
        html.push(`<li>${renderInline(trimmed.slice(2))}</li>`);
        continue;
      }

      closeList();
      html.push(`<p>${renderInline(trimmed)}</p>`);
    }

    closeList();
    return html.join("\n");
  }

  async function loadMarkdownSections() {
    const sections = document.querySelectorAll(".markdown-section[data-md]");
    for (const section of sections) {
      const source = section.getAttribute("data-md");
      try {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Could not load ${source}`);
        const markdown = await response.text();
        section.innerHTML = parseMarkdown(markdown);
      } catch (error) {
        section.innerHTML = `<p>Failed to load content from <code>${source}</code>.</p>`;
        console.error(error);
      }
    }
  }

  window.loadMarkdownSections = loadMarkdownSections;
})();
