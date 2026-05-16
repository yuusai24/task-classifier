from pathlib import Path

TEMPLATE_PATH = Path(__file__).parent.parent / "prompts" / "archive_template_utage.html"


def generate_html(summary: dict) -> str:
    html = TEMPLATE_PATH.read_text(encoding="utf-8")

    html = html.replace("金運爆上げ強化月間", _escape(summary["title"]))

    html = html.replace(
        "<p>ここに「得られること」のテキストを入れる。</p>",
        f"<p>{_escape(summary['gain'])}</p>",
    )

    points_html = "\n".join(
        f"      <li>{_escape(p)}</li>" for p in summary["points"]
    )
    html = _replace_list_block(
        html,
        '<ul class="point-list">',
        "</ul>",
        f'<ul class="point-list">\n{points_html}\n    </ul>',
    )

    steps_html = "\n".join(
        f"      <li>{_escape(s)}</li>" for s in summary["steps"]
    )
    html = _replace_list_block(
        html,
        '<ol class="step-list">',
        "</ol>",
        f'<ol class="step-list">\n{steps_html}\n    </ol>',
    )

    html = html.replace(
        '<p class="memo-text">ここに一言メモを入れる。</p>',
        f'<p class="memo-text">{_escape(summary["memo"])}</p>',
    )

    return html


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("\n", "<br>")
    )


def _replace_list_block(html: str, start_tag: str, end_tag: str, replacement: str) -> str:
    start_idx = html.find(start_tag)
    end_idx = html.find(end_tag, start_idx) + len(end_tag)
    if start_idx == -1:
        return html
    return html[:start_idx] + replacement + html[end_idx:]
