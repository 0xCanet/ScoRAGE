import os
import json
import urllib.request
import pathlib

BASE = "https://api.notion.com/v1"
KEY = os.environ.get("NOTION_API_KEY")
if not KEY:
    raise SystemExit("NOTION_API_KEY missing")

HEADERS = {
    "Authorization": f"Bearer {KEY}",
    "Notion-Version": "2025-09-03",
    "Content-Type": "application/json",
}

PARENT_PAGE_ID = "33bae760-21e1-8194-9a7c-dd9f98e0d13d"
TITLE = "ScoRAGE — spec complète des briques d'analyse documentée"
MD_PATH = pathlib.Path("/tmp/scorage_repo/ScoRAGE/docs/analysis/2026-04-08-scorage-real-analysis-product-spec.md")
text = MD_PATH.read_text()


def call(method, path, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(BASE + path, data=data, method=method, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def rich_text(content):
    content = content[:1900]
    return [{"type": "text", "text": {"content": content}}]


def block(kind, content):
    if kind.startswith("heading_"):
        return {"object": "block", "type": kind, kind: {"rich_text": rich_text(content)}}
    if kind == "paragraph":
        return {"object": "block", "type": "paragraph", "paragraph": {"rich_text": rich_text(content)}}
    if kind == "bulleted_list_item":
        return {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": rich_text(content)}}
    if kind == "quote":
        return {"object": "block", "type": "quote", "quote": {"rich_text": rich_text(content)}}
    raise ValueError(kind)


blocks = []
for raw in text.splitlines():
    line = raw.rstrip()
    if not line.strip():
        continue
    if line.startswith("### "):
        blocks.append(block("heading_3", line[4:]))
    elif line.startswith("## "):
        blocks.append(block("heading_2", line[3:]))
    elif line.startswith("# "):
        blocks.append(block("heading_1", line[2:]))
    elif line.startswith("- "):
        blocks.append(block("bulleted_list_item", line[2:]))
    elif line.startswith("> "):
        blocks.append(block("quote", line[2:]))
    elif line[:3] in {f"{i}. " for i in range(1, 10)}:
        blocks.append(block("bulleted_list_item", line))
    else:
        blocks.append(block("paragraph", line))

page = call(
    "POST",
    "/pages",
    {
        "parent": {"page_id": PARENT_PAGE_ID},
        "properties": {
            "title": {
                "title": [{"type": "text", "text": {"content": TITLE}}]
            }
        },
    },
)
page_id = page["id"]
for i in range(0, len(blocks), 50):
    call("PATCH", f"/blocks/{page_id}/children", {"children": blocks[i:i+50]})

print(json.dumps({"page_id": page_id, "url": page.get("url"), "blocks": len(blocks)}, ensure_ascii=False))
