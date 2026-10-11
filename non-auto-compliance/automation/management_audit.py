"""Formal-document inventory review; products are applicability tags only."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RESEARCH = ROOT / 'output' / 'research'

def audit(docs, meta, gaps):
    reports = [json.loads((RESEARCH / n).read_text(encoding='utf-8')) for n in
               ('accident_health.json', 'property_liability.json', 'crosscutting.json')]
    corrections = [c for r in reports for c in r.get('corrections', [])]
    for c in corrections:
        d = next(d for d in docs if d['id'] == c['id'])
        d.update(c)
        d['verified'] = '2026-09-17'
    additions = reports[0]['additions'] + reports[1]['candidates'] + reports[2]['additions']
    # The two operation guides are attachments to one formal issuance.
    before = next(d for d in additions if d['title'] == '融资性信保业务保前管理操作指引')
    after = next(d for d in additions if d['title'] == '融资性信保业务保后管理操作指引')
    before.update(title='关于印发融资性信保业务保前管理操作指引和保后管理操作指引的通知',
                  number='银保监办发〔2020〕90号', rules=before['rules'] + after['rules'])
    additions.remove(after)
    additions += [
        dict(title='中华人民共和国反洗钱法（2024年修订）', number='2024年11月8日修订', date='2024-11-08',
             effective='2025-01-01', issuer='全国人民代表大会常务委员会', category='法律', products=['通用'],
             url='https://www.npc.gov.cn/npc/c2/c30834/202411/t20241108_440887.html', source='全国人大官网',
             status='执行中', statusBasis='修订文本第65条明确2025年1月1日起施行。',
             rules=['金融机构建立反洗钱内控制度，履行客户尽职调查、资料保存、大额与可疑交易报告及特别预防措施义务。'],
             boundary='与保险业务专项尽职调查及报告规则共同适用。'),
        dict(title='金融机构客户尽职调查和客户身份资料及交易记录保存管理办法',
             number='中国人民银行、金融监管总局、证监会令〔2025〕第11号', date='2025-10-31', effective='2026-01-01',
             issuer='中国人民银行、国家金融监督管理总局、中国证券监督管理委员会', category='数据', products=['通用'],
             url='https://www.hunan.gov.cn/zqt/zcsd/202512/t20251201_33859182.html', source='政府官网转载正式全文', status='执行中',
             statusBasis='第五十二条明确施行日期，并同时废止2007年第2号及2022年第1号旧办法。',
             rules=['总公司统一部署客户尽职调查、身份核实、持续风险评估、资料与交易记录保存。',
                    '第十二、十四条规定财险、健康险及意外险等非投资型保险达到指定金额时的投保和赔付身份核实。',
                    '第三方收款需核实关系与实际收款人；依风险采取强化或简化尽调。'],
             boundary='金额触发条件和例外按正式条文执行；不以旧办法或投资型保险口径代替个人非车要求。'),
        dict(title='金融机构客户受益所有人识别管理办法', number='中国人民银行令〔2025〕第12号', date='2025-12-19', effective='2026-01-20',
             issuer='中国人民银行', category='数据', products=['通用'],
             url='https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=105384', source='商务部法规库政府全文', status='执行中',
             statusBasis='政府法规库标记现行有效，并列明2026年1月20日施行。',
             rules=['按风险识别、核实非自然人客户最终所有权与控制权，留存可靠佐证并持续管理。'],
             boundary='针对非自然人客户；受益所有人不同于保险合同受益人，不能给每个自然人投保人机械加法人识别要求。')
    ]
    for clue in reports[2]['gaps']:
        additions.append(dict(clue, date='成文日期待核', effective='原文及现行衔接待核',
                              issuer='发布主体以正式收文核对', category='销售' if '营销' in clue['title'] or '中介' in clue['title'] else '产品' if '精算' in clue['title'] else '数据',
                              products=['通用'], source='公开检索线索，原文或效力待核', status='版本待核',
                              statusBasis=clue['notes'], rules=['已定位文件名称及公开线索；具体义务须以正式现行文本复核。'],
                              boundary='不纳入已确认现行管理制度统计；不将未经核实的历史参数和报送期限作为当前义务。'))
    clue = reports[0]['additionalClues'][0]
    additions.append(dict(clue, issuer='国家金融监督管理总局、中国人民银行', category='销售', status='执行中',
                          statusBasis='政府转载正式规定列明2026年8月1日起施行。', reading='贷款合作业务的关联管理制度，按业务角色判断保险机构承担的衔接责任。',
                          action='向合作贷款人核对融资成本明示及收费责任，确认保险费用是否适用。'))
    for i, a in enumerate(additions, 1):
        a = dict(a)
        a.setdefault('products', ['借款人意外险', '信保'])
        if a['title'] == '关于开展借款人意外伤害保险业务自查清理工作的通知':
            a['reading'] = '借意险业务专项治理文件，重点核对渠道、销售与费用管理；目前仅取得文件存在性证据。'
        if a['title'] == '关于加快推进意外险改革的意见':
            a['reading'] = '意外险定价、渠道、信息披露及经营内控的正式改革意见，与后续专项监管办法衔接。'
        a.setdefault('category', '意健' if any(x['title'] == a['title'] for x in reports[0]['additions']) else '数据' if '登记' in a['title'] else '财责')
        a.setdefault('issuer', '原中国保监会' if '保监发' in a['number'] else '原中国银保监会（具体发文部门须核收文）' if a['date'].startswith(('2019', '2020')) else '国家金融监督管理总局（具体发文部门须核收文）')
        a.setdefault('reading', '按正式文件建立制度对照，适用主体与版本以原文核实。')
        a.setdefault('action', '补齐制度台账及原文，按适用业务对照内部流程。')
        a.update(id=f'M{i:02}', verified='2026-09-17', priority=True, extra=[], aliases=a['title']+' '+a['number'])
        docs.append(a)
    for d in docs:
        status = d['status']
        if '历史' in status or '阶段专项' in status:
            kind = '历史专项'
        elif '待核' in status or '待补' in status or '版本' in status:
            kind = '待核文件'
        elif '征求' in status:
            kind = '草案'
        elif d['category'] == '法律' or d['title'].startswith('中华人民共和国'):
            kind = '法律依据'
        elif d['category'] == '参考':
            kind = '参考材料'
        elif '家政' in d['title'] or '指导' in status or '改革的意见' in d['title']:
            kind = '政策指导'
        else:
            kind = '管理制度'
        d['kind'] = kind
        if d['verified'] == '2026-09-10':
            d.setdefault('statusBasis', '沿用2026年9月10日检索记录；本轮未逐条重新取得效力证明。')
        else:
            d.setdefault('statusBasis', d.get('notes', '本轮核对公开文本，未检索到明确废止；不构成最终效力证明。'))
        if isinstance(d['statusBasis'], list):
            d['statusBasis'] = '；'.join(d['statusBasis'])
        d['available'] = '原文待补' if kind in ('待核文件', '历史专项') else '公开文本或发布入口'
        if '通用' not in d['products']:
            if '意外险' in d['products'] and '借款人意外险' not in d['products']:
                d['products'].append('借款人意外险')
            if '个人责任险' in d['products']:
                d['products'] += [p for p in ('宠物责任场景', '家政雇主场景') if p not in d['products']]
    meta.update(asOf='2026-09-22', title='个人非车险 · 管理制度知识库',
                scope='以正式管理制度为主目录，按经营治理、产品精算、专项业务、渠道销售、消保及数据内控归档；以个人非车各产品线和场景作为查漏及适用标签。',
                limitation='公开全网检索整理。现行、待施行、历史专项、待核和参考分开标识；地方文件仅收样例，非全部省市清单。',
                products=['意外险','借款人意外险','短期健康险','惠民保','家财险','个人责任险','旅行险','信保','组合产品','宠物责任场景','家政雇主场景'],
                methodology='沿用原60项基础目录，移出6项借意险产品分析；新增正式文件及独立标识的历史/待核线索。部分旧条目保留原核验日期，不宣称所有文件已取得现行性证明。',
                coverage=[r['scope'] for r in reports])
    labels = {'意健':('专项业务经营管理','意外、借意、健康医疗业务专项经营制度'),
              '财责':('风险分散与专项承保管理','住宅巨灾共保、责任与信用保证专项管理'),
              '参考':('行业标准与辅助口径','标准、转载口径及地方制度样例')}
    meta['categories'] = [tuple([c[0], labels[c[0]][0], c[2], labels[c[0]][1]]) if c[0] in labels else c for c in meta['categories']]
    gaps[:] = [dict(name=d['title']+'（'+d['number']+'）', clue=str(d.get('statusBasis','')), impact=d['boundary'],
                   next=d['action']) for d in docs if d['kind'] in ('历史专项','待核文件')]
    gaps += [dict(name='全国与地方制度覆盖边界', clue='本轮检索全国监管及政府公开文件；未逐一穷尽31省全部地市、惠民保项目和巨灾试点收文。',
                  impact='当地经营还需叠加属地有效文件及未公开监管函。', next='以实际经营地区建立地方补充台账，并核对公司正式收文及后续清理目录。')]
    (RESEARCH/'本轮制度清单.json').write_text(json.dumps(dict(additions=additions, corrections=corrections), ensure_ascii=False, indent=2), encoding='utf-8')

