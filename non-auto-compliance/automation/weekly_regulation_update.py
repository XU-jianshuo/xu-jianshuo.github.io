"""Weekly official-source monitor for the non-motor compliance knowledge base.

It deliberately does not edit the published knowledge base.  It downloads the
most recent NFRA lists, compares them with the last successful snapshot, and
writes a reviewable candidate list with direct official-source links.
"""
from __future__ import annotations

import html
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output" / "weekly_updates"
STATE = OUTPUT / "state.json"
AUTO_INDEX = ROOT / "官方自动收录制度.json"
ITEMS = {
    928: "政策规章规范性文件", 927: "法律法规", 859: "政策法规",
    861: "政策文件", 4214: "监管文件", 4216: "其他政策类",
}
KEYWORDS = re.compile(
    r"保险|非车|财产|责任|意外|健康|人身|团体|短期|互联网|销售|消费者|理赔|投诉|"
    r"产品|中介|代理|经纪|公估|再保险|反欺诈|农险|农业|保证|信用|旅行|未成年|"
    r"火灾|巨灾|安全生产|共保|备案|费率|条款|适当性|个人信息|数据安全|反洗钱|"
    r"偿付能力|营销|录音录像|可回溯|回访|客户信息|承保|分支机构"
)


def clean(value: object) -> str:
    value = html.unescape(str(value or ""))
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", value)).strip()


def fetch_recent(session: requests.Session, item_id: int, pages: int = 5) -> list[dict]:
    """Fetch the newest records only; five pages per official list is ample for a weekly run."""
    records: list[dict] = []
    endpoint = "https://www.nfra.gov.cn/cbircweb/DocInfo/SelectDocByItemIdAndChild"
    for page in range(1, pages + 1):
        response = session.get(endpoint, params={"itemId": item_id, "pageSize": 20, "pageIndex": page}, timeout=30)
        response.raise_for_status()
        rows = (json.loads(response.content.decode("utf-8", "replace")).get("data") or {}).get("rows") or []
        if not rows:
            break
        records.extend(rows)
        time.sleep(0.1)
    return records


def normalise(record: dict, item_id: int) -> dict | None:
    doc_id = str(record.get("docId") or "").strip()
    if not doc_id:
        return None
    title = clean(record.get("docSubtitle") or record.get("docTitle") or record.get("title") or record.get("docName"))
    number = clean(record.get("documentNo") or record.get("docNo") or record.get("docNumber"))
    return {
        "docId": doc_id, "title": title, "number": number,
        "publishDate": clean(record.get("publishDate") or record.get("docDate") or record.get("createTime")),
        "item": item_id, "itemName": ITEMS[item_id],
        "url": f"https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId={doc_id}&itemId={item_id}",
    }


def load_state() -> dict:
    if not STATE.exists():
        return {"seenDocIds": [], "lastSuccessfulRun": None}
    return json.loads(STATE.read_text(encoding="utf-8"))


def knowledge_base_statuses() -> dict[str, dict]:
    """Capture the public library's status so future effective-date changes are reported."""
    index = json.loads((ROOT / "制度索引.json").read_text(encoding="utf-8"))
    return {
        str(doc["id"]): {"title": doc["title"], "status": doc["status"], "effective": doc["effective"], "url": doc["url"]}
        for doc in index.get("documents", [])
    }


def update_auto_index(candidates: list[dict]) -> int:
    """Persist every keyword-matched primary-source release for publication.

    These entries are intentionally visible in the public library immediately.
    The scheduled job never silently drops an official release merely because it
    is its first successful run; editorial enrichment can follow afterwards.
    """
    existing = json.loads(AUTO_INDEX.read_text(encoding="utf-8")) if AUTO_INDEX.exists() else []
    by_id = {str(item.get("docId")): item for item in existing}
    before = len(by_id)
    for item in candidates:
        by_id.setdefault(str(item["docId"]), item)
    AUTO_INDEX.write_text(json.dumps(list(by_id.values()), ensure_ascii=False, indent=2), encoding="utf-8")
    return len(by_id) - before


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    now = datetime.now().astimezone()
    run_dir = OUTPUT / now.strftime("%Y-%m-%d")
    run_dir.mkdir(exist_ok=True)
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (compatible; NonVehicleComplianceUpdater/1.0)",
        "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Referer": "https://www.nfra.gov.cn/cn/view/pages/ItemListRightList.html?itemPId=926&itemId=928",
    })
    current: dict[str, dict] = {}
    try:
        for item_id in ITEMS:
            for raw in fetch_recent(session, item_id):
                record = normalise(raw, item_id)
                if record:
                    current.setdefault(record["docId"], record)
    except (requests.RequestException, json.JSONDecodeError) as error:
        # Keep the scheduled rebuild available even when the upstream site blocks
        # a cloud runner. The failure is made explicit and no discovery baseline is
        # advanced, so the next run will retry instead of silently losing updates.
        explanation = f"{now.isoformat()}\n{type(error).__name__}: {error}\n"
        (run_dir / "失败说明.txt").write_text(explanation, encoding="utf-8")
        (run_dir / "周度更新报告.md").write_text(
            "# 非车合规知识库｜周度更新巡检失败\n\n"
            f"运行时间：{now.isoformat(timespec='seconds')}\n\n"
            "国家金融监督管理总局官网列表暂时无法从本次云端运行访问；本次没有推进新增文件发现基线。"
            "知识库页面仍已按本地明确施行日重建。下次计划运行会自动重试。\n",
            encoding="utf-8",
        )
        print(f"NFRA retrieval unavailable (will retry next run): {error}", file=sys.stderr)
        return 0

    state = load_state()
    seen = set(state.get("seenDocIds", []))
    first_run = not seen
    new_records = [record for doc_id, record in current.items() if doc_id not in seen]
    candidates = [record for record in new_records if KEYWORDS.search(record["title"] + " " + record["number"])]
    auto_added = update_auto_index(candidates)
    current_statuses = knowledge_base_statuses()
    previous_statuses = state.get("knowledgeBaseStatuses", {})
    status_changes = [
        {"id": key, **value, "previousStatus": previous_statuses[key]["status"]}
        for key, value in current_statuses.items()
        if key in previous_statuses and value["status"] != previous_statuses[key].get("status")
    ]
    (run_dir / "监管官网最新抓取.json").write_text(json.dumps(list(current.values()), ensure_ascii=False, indent=2), encoding="utf-8")
    (run_dir / "待核验候选制度.json").write_text(json.dumps(candidates, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = ["# 非车合规知识库｜周度更新候选", "", f"运行时间：{now.isoformat(timespec='seconds')}", "来源：国家金融监督管理总局官网公开栏目（仅抓取最近五页/栏目）。", ""]
    if not candidates and not status_changes:
        lines += ["本周未发现标题或文号命中个人非车险合规范围的新增候选。", "", "仍请留意地方金融监管局、国务院及其他部门发布的跨领域文件；它们不在本次总局栏目扫描范围内。"]
    else:
        if status_changes:
            lines += [f"已收录制度状态变更：{len(status_changes)} 项。", ""]
            for item in status_changes:
                lines += [f"- [{item['title']}]({item['url']})：{item['previousStatus']} → {item['status']}（施行信息：{item['effective']}）"]
            lines += [""]
        lines += [f"本周发现 {len(candidates)} 项官方新增文件（已从 {len(new_records)} 项官网新增记录中按关键词筛选）：", ""]
        for item in candidates:
            lines += [f"- [{item['title']}]({item['url']})", f"  - {item['number'] or '文号待核'}｜{item['publishDate'] or '发布日期待核'}｜{item['itemName']}"]
        lines += ["", f"其中 {auto_added} 项已自动进入公开制度库的“监管官网自动收录”目录；后续补充适用范围、条文解读和替代关系。"]
    (run_dir / "周度更新报告.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    state.update({"seenDocIds": sorted(set(seen) | set(current)), "knowledgeBaseStatuses": current_statuses, "lastSuccessfulRun": now.isoformat(), "lastRunDirectory": str(run_dir.relative_to(ROOT))})
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"firstRun": first_run, "scanned": len(current), "new": len(new_records), "candidates": len(candidates), "autoAdded": auto_added, "statusChanges": len(status_changes), "report": str(run_dir / "周度更新报告.md")}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
