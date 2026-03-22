from pathlib import Path
import html

ROOT = Path(__file__).resolve().parents[1]


def render_inline(text: str) -> str:
    out = html.escape(text)
    import re
    out = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", out)
    out = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', out)
    return out


def parse_markdown(md: str) -> str:
    lines = md.splitlines()
    html_lines = []
    in_list = False
    in_details = False

    def close_list():
        nonlocal in_list
        if in_list:
            html_lines.append("</ul>")
            in_list = False

    for raw in lines:
        line = raw.rstrip()
        trimmed = line.strip()

        if trimmed.startswith("<details"):
            close_list()
            in_details = True
            html_lines.append(trimmed)
            continue
        if in_details:
            if trimmed.startswith("<summary") or trimmed.startswith("</details"):
                html_lines.append(trimmed)
            elif trimmed:
                html_lines.append(f"<p>{render_inline(trimmed)}</p>")
            else:
                html_lines.append("")
            if trimmed.startswith("</details"):
                in_details = False
            continue

        if not trimmed:
            close_list()
            continue
        if trimmed.startswith("## "):
            close_list()
            html_lines.append(f"<h2>{render_inline(trimmed[3:])}</h2>")
            continue
        if trimmed.startswith("### "):
            close_list()
            html_lines.append(f"<h3>{render_inline(trimmed[4:])}</h3>")
            continue
        if trimmed.startswith("- "):
            if not in_list:
                html_lines.append("<ul>")
                in_list = True
            html_lines.append(f"<li>{render_inline(trimmed[2:])}</li>")
            continue

        close_list()
        html_lines.append(f"<p>{render_inline(trimmed)}</p>")

    close_list()
    return "\n".join(html_lines)


def build() -> None:
    template = (ROOT / "index.template.html").read_text()
    papers = parse_markdown((ROOT / "content/papers.md").read_text())
    teaching = parse_markdown((ROOT / "content/teaching.md").read_text())
    policy = parse_markdown((ROOT / "content/policy.md").read_text())

    output = (
        template.replace("{{PAPERS_HTML}}", papers)
        .replace("{{TEACHING_HTML}}", teaching)
        .replace("{{POLICY_HTML}}", policy)
    )

    (ROOT / "index.html").write_text(output)


if __name__ == "__main__":
    build()
