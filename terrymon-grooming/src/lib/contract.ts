const SHOP = {
  name: 'TerryMon 寵物美容',
  taxId: '78901234',
  phone: '02-2345-6789',
  address: '台北市大安區復興南路一段200號',
  representative: '陳信宏',
}

export interface ContractParams {
  memberName: string
  memberPhone: string
  memberId: string
  petName: string
  petBreed: string
  petWeight: number
  petAllergies: string[]
  services: { name: string; price: number }[]
  totalPrice: number
  signatureDataUrl?: string
}

const ARTICLES = `
<h3 style="font-size:13px;font-weight:bold;margin:10px 0 2px">第一條（服務範圍）</h3>
<p style="margin:0 0 6px 12px;color:#333">本次乙方所提供之項目如服務內容表所載，乙方應依行業良好作業規範完成前述項目。</p>
<h3 style="font-size:13px;font-weight:bold;margin:10px 0 2px">第二條（權利義務依據）</h3>
<p style="margin:0 0 6px 12px;color:#333">甲乙雙方關於本件寵物美容之權利義務，依本契約條款之約定定之；本契約未約定者，依有關法令及誠信原則定之。</p>
<h3 style="font-size:13px;font-weight:bold;margin:10px 0 2px">第三條（服務說明義務）</h3>
<p style="margin:0 0 6px 12px;color:#333">乙方應將服務項目、對價及實施方式，於服務前向甲方充分說明，並製作紀錄，自服務完成翌日起保留至少二年，並提供甲方紀錄影本以供查對。</p>
<h3 style="font-size:13px;font-weight:bold;margin:10px 0 2px">第四條（乙方詢問及處置義務）</h3>
<p style="margin:0 0 6px 12px;color:#333">乙方於實施前應詢問寵物過敏史及特殊健康狀況，甲方應誠實告知。服務期間如發現寵物狀況異常，乙方應即中止服務並採取適當處置措施通知甲方。</p>
<h3 style="font-size:13px;font-weight:bold;margin:10px 0 2px">第五條（費用明確性）</h3>
<p style="margin:0 0 6px 12px;color:#333">本次服務費用如服務內容表所載。繳費項目未明列者，乙方不得向甲方收取。</p>
<h3 style="font-size:13px;font-weight:bold;margin:10px 0 2px">第六條（個人資料保護）</h3>
<p style="margin:0 0 6px 12px;color:#333">乙方因甲方參加本契約之服務而知悉甲方及寵物相關資料，應予保密並依個人資料保護法相關規定辦理，違反者應負賠償責任。</p>
<h3 style="font-size:13px;font-weight:bold;margin:10px 0 2px">第七條（爭議處理）</h3>
<p style="margin:0 0 6px 12px;color:#333">甲乙雙方就本契約發生消費爭議時，甲方得依消費者保護法之規定，為申訴、申請調解或提起消費訴訟。</p>
<h3 style="font-size:13px;font-weight:bold;margin:10px 0 2px">第八條（契約書保管）</h3>
<p style="margin:0 0 6px 12px;color:#333">本契約以電子方式留存，甲方得透過 TerryMon App 隨時查閱，乙方不得藉故拒絕提供。</p>`

const TD = 'padding:5px 8px;border:1px solid #ddd'
const TH = `${TD};background:#f5f5f5;font-weight:bold`

export function generateContractHtml(p: ContractParams): string {
  const now = new Date()
  const roc = now.getFullYear() - 1911
  const m = now.getMonth() + 1
  const d = now.getDate()
  const allergies = p.petAllergies.length ? p.petAllergies.join('、') : '無'
  const rows = p.services.map(s =>
    `<tr><td style="${TD}">${s.name}</td><td style="${TD};text-align:right">NT$ ${s.price.toLocaleString()}</td><td style="${TD};text-align:center">1次</td><td style="${TD};text-align:right">NT$ ${s.price.toLocaleString()}</td><td style="${TD};text-align:center">當日</td></tr>`
  ).join('')
  const sig = p.signatureDataUrl
    ? `<img src="${p.signatureDataUrl}" style="height:64px;max-width:220px;display:block;border-bottom:2px solid #333" />`
    : `<div style="width:200px;height:60px;border-bottom:2px solid #333"></div>`

  return `<div style="font-family:'Noto Sans TC',sans-serif;font-size:13px;line-height:1.7;color:#111">
<p style="font-size:10px;color:#888;text-align:center;margin:0 0 4px">衛生福利部112年6月8日衛授疾字第1120300459號函發布（寵物美容適用版）</p>
<h1 style="font-size:18px;font-weight:bold;text-align:center;margin:0 0 12px">寵物美容定型化契約書</h1>
<div style="border:1px solid #ccc;padding:8px 12px;margin-bottom:12px;font-size:12px">本契約於中華民國 ${roc} 年 ${m} 月 ${d} 日由甲方攜回審閱（審閱期間至少三日）</div>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px">
  <tr><td style="${TH};width:14%;vertical-align:middle" rowspan="2">消費者<br>(甲方)</td><td style="${TD}">姓名：${p.memberName}</td><td style="${TD}">會員編號：${p.memberId}</td><td style="${TD}">電話：${p.memberPhone}</td></tr>
  <tr><td colspan="3" style="${TD}">服務寵物：${p.petName}（${p.petBreed}）・體重 ${p.petWeight} kg・過敏記錄：${allergies}</td></tr>
  <tr><td style="${TH};vertical-align:middle" rowspan="2">美容業者<br>(乙方)</td><td style="${TD}">名稱：${SHOP.name}</td><td style="${TD}">統一編號：${SHOP.taxId}</td><td style="${TD}">電話：${SHOP.phone}</td></tr>
  <tr><td colspan="3" style="${TD}">代表人：${SHOP.representative}・地址：${SHOP.address}</td></tr>
</table>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">
  <tr><th style="${TH}" colspan="5">服務內容</th></tr>
  <tr><th style="${TD};background:#fafafa">項目</th><th style="${TD};background:#fafafa">單價</th><th style="${TD};background:#fafafa">次數</th><th style="${TD};background:#fafafa">總費用</th><th style="${TD};background:#fafafa">期間</th></tr>
  ${rows}
  <tr style="background:#fff6e8"><td colspan="3" style="${TD};font-weight:bold;text-align:right">服務費用合計</td><td colspan="2" style="${TD};font-weight:bold;color:#f28c00">NT$ ${p.totalPrice.toLocaleString()}</td></tr>
  <tr><td style="${TH}">支付方法</td><td colspan="4" style="${TD}">現金支付：中華民國 ${roc} 年 ${m} 月 ${d} 日（新臺幣 ${p.totalPrice.toLocaleString()} 元）</td></tr>
  <tr><td style="${TH}">預定實施日</td><td colspan="4" style="${TD}">中華民國 ${roc} 年 ${m} 月 ${d} 日</td></tr>
  <tr><td style="${TH}">書面契約交付日</td><td colspan="4" style="${TD}">中華民國 ${roc} 年 ${m} 月 ${d} 日</td></tr>
</table>
<div style="border-bottom:2px solid #f28c00;padding-bottom:4px;margin-bottom:8px;font-weight:bold">甲乙雙方同意就寵物美容契約事項依下列約定辦理：</div>
${ARTICLES}
<table style="width:100%;margin-top:20px;border-collapse:collapse">
  <tr>
    <td style="padding:8px;vertical-align:top;width:50%"><p style="font-weight:bold;margin-bottom:8px">甲方（消費者）簽章：</p>${sig}<p style="margin-top:4px;font-size:11px;color:#666">姓名：${p.memberName}</p></td>
    <td style="padding:8px;vertical-align:top;width:50%"><p style="font-weight:bold;margin-bottom:8px">乙方（美容業者）：</p><p style="font-size:12px">${SHOP.name}</p><p style="font-size:11px;color:#666">代表人：${SHOP.representative}</p></td>
  </tr>
</table>
<p style="text-align:center;margin-top:16px;font-size:12px;color:#666">中華民國 ${roc} 年 ${m} 月 ${d} 日</p>
</div>`
}
