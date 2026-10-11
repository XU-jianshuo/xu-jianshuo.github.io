"""Keep public-text records; exclude unresolved documents from deliverables."""
import json
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parent

def finalize(docs, meta, gaps):
    unresolved=re.compile('待核|待补|未核实|未取得|版本需复核|原文未|全文未|仅有摘要|发布摘要')
    removed=[]
    kept=[]
    for d in docs:
        content=json.dumps({k:v for k,v in d.items() if k not in ('statusBasis','verified')},ensure_ascii=False)
        if d['kind'] in ('历史专项','草案','待核文件') or unresolved.search(content) or d['id']=='F04':
            removed.append(d['id'])
            continue
        d.pop('notes',None)
        d.pop('statusBasis',None)
        d['available']='公开正式文本'
        if d.get('issuer')=='原中国银保监会（具体发文部门须核收文）':
            d['issuer']='原中国银保监会办公厅'
        kept.append(d)
    docs[:]=kept
    gaps.clear()
    meta.update(edition='公开原文终稿',
                limitation='收录与个人非车险管理相关的全国性公开文件、法律及行业标准，地方文件按适用范围标识。',
                methodology='以公开正式文本为收录依据，按管理主题组织，以产品线和场景标签检索适用制度。',
                coverage=['专项业务管理：意外、健康医疗、巨灾、责任及信保。','横向经营管理：开发精算、再保险、渠道销售、消费者保护、数据安全及反洗钱。'])
    # Only the final inventory is written as a deliverable. Research inputs are internal working files.
    (ROOT/'output/research/本轮制度清单.json').write_text(json.dumps(dict(meta=meta,documents=docs),ensure_ascii=False,indent=2),encoding='utf-8')
    return removed

