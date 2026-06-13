'use client'
import { forwardRef } from 'react'

export interface ContractData {
  memberName: string
  memberPhone: string
  memberId: string
  petName: string
  petBreed: string
  petWeight: number
  petAllergies: string[]
  services: { name: string; price: number; isAddon: boolean; duration: number }[]
  totalPrice: number
  shopName: string
  shopPhone: string
  shopAddress: string
  signatureData: string
}

const F = '"PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif'

const S = {
  page: {
    width: '794px',
    minHeight: '1123px',
    height: '1123px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: '56px 72px 48px',
    boxSizing: 'border-box' as const,
    fontFamily: F,
    fontSize: '10.5px',
    lineHeight: '1.8',
    color: '#000',
    position: 'relative' as const,
  },
  coverH1: {
    textAlign: 'center' as const,
    fontSize: '22px',
    letterSpacing: '6px',
    fontWeight: 'bold',
    margin: '48px 0 60px',
  },
  govRef: { textAlign: 'right' as const, fontSize: '9.5px', marginBottom: '16px', color: '#333' },
  label: { fontWeight: 'bold', display: 'inline-block' as const, minWidth: '140px' },
  ul: {
    borderBottom: '1px solid #000',
    display: 'inline-block' as const,
    minWidth: '200px',
    paddingLeft: '6px',
  },
  td: { border: '1px solid #000', padding: '5px 8px', verticalAlign: 'top' as const, fontSize: '10px' },
  th: {
    border: '1px solid #000', padding: '5px 8px',
    backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '10px',
  },
  artTitle: {
    fontWeight: 'bold',
    marginTop: '9px',
    marginBottom: '1px',
    fontSize: '10.5px',
  },
  p: { margin: '0 0 3px 0', textIndent: '2em' },
  p0: { margin: '0 0 3px 0' },
  pageNum: {
    position: 'absolute' as const,
    bottom: '24px',
    left: 0,
    right: 0,
    textAlign: 'center' as const,
    fontSize: '10px',
    color: '#666',
  },
}

function today() {
  const d = new Date()
  return `中華民國${d.getFullYear() - 1911}年${d.getMonth() + 1}月${d.getDate()}日`
}
function rocYear() {
  return new Date().getFullYear() - 1911
}

const ContractDocument = forwardRef<HTMLDivElement, ContractData>((p, ref) => {
  const {
    memberName, memberPhone, memberId,
    petName, petBreed, petWeight, petAllergies,
    services, totalPrice, shopName, shopPhone, shopAddress, signatureData,
  } = p
  const dateStr = today()
  const roc = rocYear()
  const allergyText = petAllergies.length > 0 ? petAllergies.join('、') : '無'
  const mainService = services.find(s => !s.isAddon)
  const addons = services.filter(s => s.isAddon)
  const serviceList = services.map(s => s.name).join('、')

  return (
    <div ref={ref}>

      {/* ══ PAGE 1：封面 ══ */}
      <div style={S.page}>
        <div style={S.govRef}>
          衛生福利部112年6月8日衛授疾字第1120300459號函發布
        </div>

        <div style={S.coverH1}>寵物美容服務定型化契約書</div>

        <p style={{ marginBottom: '24px', fontSize: '11px' }}>
          本契約於中華民國&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日由甲方攜回審閱（審閱期間至少三日）
        </p>

        <p style={{ marginBottom: '20px', fontSize: '11px' }}>立契約書人</p>

        <p style={{ marginBottom: '14px', fontSize: '11px' }}>
          <span style={S.label}>消 費 者 姓 名：</span>
          <span style={S.ul}>{memberName}</span>（以下簡稱甲方）
        </p>
        <p style={{ marginBottom: '14px', fontSize: '11px' }}>
          <span style={S.label}>消費者聯絡電話：</span>
          <span style={S.ul}>{memberPhone}</span>
        </p>
        <p style={{ marginBottom: '40px', fontSize: '11px' }}>
          <span style={S.label}>美 容 業 者 名 稱：</span>
          <span style={S.ul}>{shopName}</span>（以下簡稱乙方）
        </p>

        <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>甲方簽章：</p>
        <div style={{ marginBottom: '40px', height: '90px', border: '1px solid #ddd', width: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {signatureData
            ? <img src={signatureData} alt="甲方電子簽名" style={{ height: '88px', maxWidth: '278px', objectFit: 'contain' }} />
            : <span style={{ color: '#aaa', fontSize: '10px' }}>（電子簽名）</span>
          }
        </div>

        <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>乙方簽章：</p>
        <div style={{ width: '200px', height: '60px', borderBottom: '1px solid #000' }} />

        <div style={S.pageNum}>— 1 —</div>
      </div>

      {/* ══ PAGE 2：契約明細表 ══ */}
      <div style={S.page}>
        <p style={{ fontSize: '10.5px', marginBottom: '4px' }}>
          簽訂契約前，乙方應將契約交付甲方審閱，審閱期間至少三日。詳讀內附條款，不同意之條款得與乙方協商增刪。
        </p>
        <p style={{ fontSize: '10.5px', marginBottom: '12px' }}>
          基於內附條款，締結以下契約。
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '8px' }}>
          <tbody>
            {/* 甲方資訊 */}
            <tr>
              <td style={{ ...S.td, width: '70px', textAlign: 'center' as const, fontWeight: 'bold', backgroundColor: '#f5f5f5' }} rowSpan={3}>
                消費者<br />（甲方）
              </td>
              <td style={{ ...S.td, width: '80px', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>姓名</td>
              <td style={S.td}>{memberName}</td>
              <td style={{ ...S.td, width: '80px', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>聯絡電話</td>
              <td style={S.td}>{memberPhone}</td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>會員編號</td>
              <td style={S.td}>{memberId}</td>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>出生年月日</td>
              <td style={S.td}>&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日</td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>地址</td>
              <td colSpan={3} style={S.td}>&nbsp;</td>
            </tr>
            {/* 寵物資訊 */}
            <tr>
              <td style={{ ...S.td, textAlign: 'center' as const, fontWeight: 'bold', backgroundColor: '#f5f5f5' }} rowSpan={2}>
                寵物資訊
              </td>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>名稱</td>
              <td style={S.td}>{petName}</td>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>品種</td>
              <td style={S.td}>{petBreed}</td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>體重</td>
              <td style={S.td}>{petWeight} kg</td>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>過敏史</td>
              <td style={S.td}>{allergyText}</td>
            </tr>
            {/* 乙方資訊 */}
            <tr>
              <td style={{ ...S.td, textAlign: 'center' as const, fontWeight: 'bold', backgroundColor: '#f5f5f5' }} rowSpan={2}>
                美容業者<br />（乙方）
              </td>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>名稱</td>
              <td style={S.td}>{shopName}</td>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>電話</td>
              <td style={S.td}>{shopPhone}</td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>營業地址</td>
              <td colSpan={3} style={S.td}>{shopAddress}</td>
            </tr>
          </tbody>
        </table>

        {/* 服務內容表 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '6px' }}>
          <thead>
            <tr>
              <th colSpan={5} style={{ ...S.th, textAlign: 'center' as const, backgroundColor: '#e8e8e8' }}>服務內容</th>
            </tr>
            <tr>
              <th style={{ ...S.th, width: '40%' }}>項目名稱</th>
              <th style={{ ...S.th, width: '15%', textAlign: 'right' as const }}>單價（元）</th>
              <th style={{ ...S.th, width: '10%', textAlign: 'center' as const }}>次數</th>
              <th style={{ ...S.th, width: '15%', textAlign: 'right' as const }}>費用（元）</th>
              <th style={{ ...S.th, width: '20%' }}>備註</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={i}>
                <td style={S.td}>{s.name}</td>
                <td style={{ ...S.td, textAlign: 'right' as const }}>{s.price.toLocaleString()}</td>
                <td style={{ ...S.td, textAlign: 'center' as const }}>1</td>
                <td style={{ ...S.td, textAlign: 'right' as const }}>{s.price.toLocaleString()}</td>
                <td style={S.td}>{s.isAddon ? '加購項目' : '主要服務'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 收取金額 & 付款 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td style={{ ...S.td, width: '80px', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>收取金額</td>
              <td style={S.td}>
                服務費用：新臺幣 <strong>{totalPrice.toLocaleString()}</strong> 元整
                &emsp;合計：新臺幣 <strong>{totalPrice.toLocaleString()}</strong> 元整
              </td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>支付方法</td>
              <td style={S.td}>
                ☑ (一)現金支付：新臺幣 {totalPrice.toLocaleString()} 元，於 {dateStr} 給付。&emsp;
                □ (二)支票支付。&emsp;
                □ (三)信用卡支付。&emsp;
                □ (四)其他：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;。
              </td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>預定實施日</td>
              <td style={S.td}>{dateStr}</td>
            </tr>
            <tr>
              <td style={{ ...S.td, fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>書面契約交付日</td>
              <td style={S.td}>{dateStr}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '9.5px', color: '#444', marginTop: '6px' }}>
          ☑ 乙方已將本契約及所有附件交付甲方，並給予至少三日之審閱期間。　甲方確認簽章：{memberName}（電子簽名）
        </p>

        <div style={S.pageNum}>— 2 —</div>
      </div>

      {/* ══ PAGE 3：條款第一條～第四條 ══ */}
      <div style={S.page}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' as const, fontSize: '11px' }}>
          寵物美容服務定型化契約條款
        </p>
        <p style={{ ...S.p0, marginBottom: '6px' }}>甲乙雙方同意就本寵物美容服務契約事項依下列約定辦理：</p>

        <p style={S.artTitle}>第　一　條（服務之定義與服務範圍）</p>
        <p style={S.p0}>
          本契約所稱寵物美容，指為寵物提供洗澡、吹乾、剪毛、造型及相關護理等服務。
        </p>
        <p style={S.p0}>本契約乙方所提供之項目（已勾選者為本次服務項目）：</p>
        <div style={{ paddingLeft: '1em', lineHeight: '1.7' }}>
          {['基礎洗澡（含吹乾）', '洗澡＋剪毛', '全套精緻造型', '香氛深層護毛', '牙齒潔淨護理', '耳道深層清潔', '趾甲修剪磨圓', '肛門腺清潔'].map(item => {
            const checked = services.some(s => s.name.includes(item.slice(0, 4)))
            return (
              <span key={item} style={{ marginRight: '12px', display: 'inline-block' as const }}>
                {checked ? '☑' : '□'} {item}；
              </span>
            )
          })}
          <span>□ 其他：{services.filter(s => s.name).map(s => s.name).join('、')}。</span>
        </div>
        <p style={S.p}>
          乙方完成前述項目之方式依現場標準作業程序辦理，並依個別寵物狀況調整。
        </p>
        <p style={{ ...S.p0, marginTop: '2px' }}>
          ☑ 乙方與甲方訂立契約前，已將本契約及所有附件交付甲方並給予至少三日之期間以審閱契約內容。&emsp;甲方簽章：{memberName}（電子簽名）
        </p>

        <p style={S.artTitle}>第　二　條（權利義務之依據）</p>
        <p style={S.p}>
          甲乙雙方關於本件寵物美容之權利義務，依本契約條款之約定定之；本契約未約定者，依有關法令及誠信原則定之。
        </p>
        <p style={S.p}>
          本契約之附件、乙方之廣告及本契約當事人間之口頭約定，均為本契約內容之一部分。
        </p>
        <p style={S.p}>
          甲乙雙方之其他特別協議事項，其效力優於本契約條款。但本契約條款較其他特別協議事項更有利於甲方，而為甲方於協議時所不知者，不在此限。
        </p>

        <p style={S.artTitle}>第　三　條（會員權利義務之說明）</p>
        <p style={S.p}>
          甲方如有需要，得申請成為乙方之會員，其權利義務依會員規約之規定（如附件　　），雙方其他權利義務並得以書面約定之。會員就相同服務項目所得享受之權利，不得低於非會員；所負擔之義務，不得高於非會員。
        </p>
        <p style={S.p}>
          前項會員規約為本契約之一部分，並應於訂約前交付甲方審閱。
        </p>
        <p style={S.p}>
          乙方應就會員種類及會員資格之權利義務，於訂約前向甲方為詳細明確之口頭說明，同時提供口頭說明內容相同之書面文件，並經甲方簽名確認。
        </p>
        <p style={S.p}>
          如發行會員卡者，會員卡不慎遺失、毀損或被竊時，乙方於甲方申請補發後，應製作補發新卡，並得酌收製卡工本費（不得逾新臺幣一百元）。
        </p>

        <p style={S.artTitle}>第　四　條（繼續性服務、項目及方式之說明）</p>
        <p style={S.p}>
          乙方應將甲方得接受服務實施之條件及甲方所選擇之服務項目、對價、計價方式、次數、期間、效果分析、副作用、危險性等，及為實施服務所必須購買相關商品之內容、性質、效用、數量及價格，於訂約前向甲方為充分明確之說明，並提供相關之書面。
        </p>
        <p style={S.p}>
          乙方應將為甲方提供服務內容及使用之商品，製作紀錄並經甲方簽名確認後，自契約終止或解除翌日起保留至少二年，並提供甲方紀錄影本，以供查對；甲方並得隨時請求乙方提供前述紀錄之影本。
        </p>
        <p style={S.p}>
          前項乙方提供甲方之紀錄影本，得以書面、電子或其他適當之方法為之。
        </p>

        <div style={S.pageNum}>— 3 —</div>
      </div>

      {/* ══ PAGE 4：條款第五條～第七條 ══ */}
      <div style={S.page}>
        <p style={S.artTitle}>第　五　條（乙方之詢問及處置義務）</p>
        <p style={S.p}>
          乙方於實施服務前，應詢問、確認寵物有無因患疾現正治療中、是否屬過敏性體質、現有無服用何種藥物、皮毛有無敏感性及其他不利於接受服務之事項。甲方對於乙方之詢問應誠實告知。
        </p>
        <p style={S.p}>
          前項詢問，應以書面為之，並經甲方簽名確認後保留至少二年，並提供甲方紀錄影本，以供查對；甲方並得隨時請求乙方提供前述紀錄之影本。
        </p>
        <p style={S.p}>
          前項乙方提供甲方之紀錄影本，得以書面、電子或其他適當之方法為之。
        </p>
        <p style={S.p}>
          於甲方接受繼續性服務，任一方發現寵物身體狀況有異樣或實施部位有異常現象時，應即告知他方。乙方除應即中止實施外，並有義務採取讓寵物接受獸醫師診治等適當之處理措施。但甲方發生異常或異樣情形之原因，如非乙方之實施行為、使用之商品或甲方未對乙方之詢問誠實告知所致者，甲方應負擔乙方所採取處理措施之相關費用。
        </p>
        <p style={S.p}>
          關於診治獸醫師之選定，應尊重甲方之意見。於寵物受診療期間中，就該服務契約之期間應予延長。
        </p>

        <p style={S.artTitle}>第　六　條（費用明確性原則）</p>
        <p style={S.p}>
          乙方提供服務之費用，應以各項服務及相關商品為單位，分別計算及標示清楚，不得以籠統總價方式說明。
        </p>
        <p style={S.p}>
          乙方未於本契約或其他方式明確告知甲方之費用項目，乙方不得向甲方收取。
        </p>
        <p style={S.p}>
          乙方不得向甲方收取說明中（如廣告、型錄等）未曾揭示之費用。
        </p>

        <p style={S.artTitle}>第　七　條（價金金額與付款方式）</p>
        <p style={{ ...S.p0, marginBottom: '2px' }}>甲方應給付乙方之價金及付款方式如下：</p>
        <p style={{ paddingLeft: '2em', margin: '0 0 1px' }}>
          (一)現金支付：新臺幣 <u>{totalPrice.toLocaleString()}</u> 元，於 <u>{dateStr}</u> 給付。
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 1px' }}>
          (二)支票支付：新臺幣　　　　元，票載日期為　　年　　月　　日。（□本次適用）
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 1px' }}>
          (三)信用卡支付：新臺幣　　　　元，持卡人：　　　　，信用卡末四碼：　　，刷卡日期：　　年　　月　　日；或以感應、掃碼方式支付。（□本次適用）
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 4px' }}>
          (四)其他方式：　　　　　　　　。（□本次適用）
        </p>
        <p style={S.p}>
          前項付款，乙方不得要求甲方以貸款方式支付，或藉故要求甲方簽訂借貸或分期付款契約。
        </p>
        <p style={S.p}>
          前項貸款方式，係指乙方自行辦理或以任何形式之協助、轉介予金融機構或第三人辦理消費貸款而言。
        </p>
        <p style={S.p}>
          乙方如以轉讓或其他形式，使第三人取得對甲方之債權者，應事先書面告知甲方，甲方並得主張對乙方所得主張之一切抗辯事由對抗該第三人。
        </p>

        <p style={S.artTitle}>第　八　條（卡、憑證之使用）</p>
        <p style={S.p}>
          乙方如以會員卡、預付費用類電子票證或任何類似功能卡片（下稱卡）或憑證作為提供服務之憑證者，應就卡或憑證之使用方式、服務內容、可使用之時段及次數等，向甲方為明確之說明，並載明於本契約。
        </p>
        <p style={S.p}>
          依本契約取得之卡或憑證，如有遺失，甲方應即通知乙方；自通知乙方時起，乙方應停止卡或憑證之使用。
        </p>
        <p style={S.p}>
          本契約解除或終止後，乙方應退還相應之價金，甲方應返還卡或憑證。
        </p>

        <div style={S.pageNum}>— 4 —</div>
      </div>

      {/* ══ PAGE 5：條款第九條～第十三條 ══ */}
      <div style={S.page}>
        <p style={S.artTitle}>第　九　條（實施前，甲方任意解除契約之退費規定）</p>
        <p style={S.p}>
          甲方於繼續性服務實施前或簽約當日即有償接受服務，因甲方任意解除本契約者，乙方應於解約日後十五日內，將已收取之費用扣除解約手續費後退還於甲方。
        </p>
        <p style={S.p}>
          前項所稱解約手續費，為本契約總費用百分之五（但其最高金額不得逾本契約總費用百分之五）。若未約定解約手續費之金額時，乙方不得扣除解約手續費。
        </p>
        <p style={S.p}>
          甲方於簽約後三日內（不含簽約當日）行使解除權者，乙方不得向甲方收取任何費用。
        </p>

        <p style={S.artTitle}>第　十　條（實施後，甲方任意終止契約之退費規定）</p>
        <p style={S.p}>
          甲方於繼續性服務實施後，因任意終止本契約者，乙方應於終止日後三十日內，將甲方已繳之價金，扣除甲方已接受服務之費用及解約手續費後，退還於甲方。
        </p>
        <p style={S.p}>
          前項甲方已接受服務之費用，以本契約所定各服務項目之單價計算之；如本契約未明定各服務項目單價，以各服務占全部服務之比例乘以總費用之方式計算之。
        </p>
        <p style={S.p}>
          第一項解約手續費，為未履行金額之百分之十（但其最高金額不得逾退還金額之百分之十五）；若未約定解約手續費，乙方不得扣除。
        </p>
        <p style={S.p}>
          乙方不得就已實施之各服務項目，以高於本契約所定單價計算費用向甲方請求補償。
        </p>

        <p style={S.artTitle}>第十一條（可歸責於乙方，甲方解除或終止契約之退費規定）</p>
        <p style={S.p}>
          可歸責於乙方之事由（包括但不限於：服務品質不符約定、服務人員無故變更、未依約提供服務項目、服務地點未經同意變更等）致甲方解除或終止本契約者，乙方應依下列方式退費：
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 1px' }}>
          一、服務實施前解除者，依第九條規定退費，但不得扣除解約手續費，並應賠償甲方相當於解約手續費金額之損害。
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 4px' }}>
          二、服務實施後終止者，依第十條規定退費，但不得扣除解約手續費，並應賠償甲方相當於解約手續費金額之損害。
        </p>
        <p style={S.p}>
          前項情形，乙方並應退還所收取費用中已超過甲方接受服務比例之金額。
        </p>

        <p style={S.artTitle}>第十二條（不可歸責於雙方，解除或終止契約之退費規定）</p>
        <p style={S.p}>
          因不可歸責於甲乙雙方之事由，致無法繼續履行本契約者，雙方得解除或終止本契約，乙方應依下列方式退費：
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 1px' }}>
          一、服務尚未實施者，乙方應退還全部已收取之費用，不得收取任何手續費。
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 4px' }}>
          二、服務已部分實施者，乙方應退還相應比例之未履行費用，不得扣除解約手續費。
        </p>
        <p style={S.p}>
          前項情形之認定，有爭議時，得由當地消費爭議調解委員會調解之。
        </p>
        <p style={S.p}>
          前項不可歸責之事由，包括天災、政府強制命令或甲方發生重大事故（如死亡、重大傷病、不可預期之工作調動致無法接受服務）等。
        </p>

        <p style={S.artTitle}>第十三條（終止契約後乙方之附隨義務）</p>
        <p style={S.p}>
          本契約終止或解除後，乙方就有關寵物健康及已實施服務之紀錄，於二年內仍有義務提供必要之告知及協助，並應於甲方請求時，交付第四條及第五條之服務紀錄影本。
        </p>
        <p style={S.p}>
          前項紀錄影本，得以書面、電子或其他適當方式交付。
        </p>

        <div style={S.pageNum}>— 5 —</div>
      </div>

      {/* ══ PAGE 6：條款第十四條～第二十條 ══ */}
      <div style={S.page}>
        <p style={S.artTitle}>第十四條（解除或終止契約之方式）</p>
        <p style={S.p}>
          甲乙雙方得依法令規定以書面或其他方式向他方為解除或終止契約之意思表示。
        </p>
        <p style={S.p}>
          以書面方式解除或終止契約者，其範本如本契約附件（解除∕終止契約書範本）。
        </p>
        <p style={S.p}>
          以書面以外之方式（含電話、電子郵件、LINE 等通訊軟體）解除或終止契約者，乙方應於七日內以書面確認，並回覆甲方。
        </p>

        <p style={S.artTitle}>第十五條（甲方受領服務之預約）</p>
        <p style={S.p}>
          甲方受領服務，應依乙方規定之方式預約，並於約定時間到場。
        </p>
        <p style={S.p}>
          甲方如有未能依預約時間到場，應事先通知乙方。
        </p>
        <p style={S.p}>
          甲方逾約定時間未到，且未事先通知乙方者，乙方得扣除當次服務費用；所扣除費用不得逾該次服務單價。
        </p>
        <p style={S.p}>
          乙方不得以甲方未依時預約或臨時通知取消，作為拒絕服務之藉口，但一個月內三次以上之無故失約不在此限。
        </p>

        <p style={S.artTitle}>第十六條（擔保條款）</p>
        <p style={S.p}>
          乙方如就服務效果或商品效用向甲方為特定之擔保者，應以書面載明擔保之內容、期間及達成之標準。
        </p>
        <p style={S.p}>
          甲方依乙方指示配合相關注意事項，但仍未達前項擔保約定者，乙方應返還甲方已付之全部費用，或依約定提供相應之補救服務，不得另行要求甲方支付任何費用。
        </p>

        <p style={S.artTitle}>第十七條（乙方履約保障）</p>
        <p style={S.p}>
          甲方以全額預付方式給付對價，且依本契約給付金額逾新臺幣五萬元者，乙方應就超逾五萬元之部分，選擇下列一種以上之方式提供履約保障，並應事前告知甲方：
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 1px' }}>一、由金融機構為乙方之履約保證。</p>
        <p style={{ paddingLeft: '2em', margin: '0 0 1px' }}>二、以信託方式，將收取費用交付信託管理。</p>
        <p style={{ paddingLeft: '2em', margin: '0 0 1px' }}>三、由同業業者擔任連帶保證人。</p>
        <p style={{ paddingLeft: '2em', margin: '0 0 4px' }}>四、依中央主管機關指定之其他方式。</p>
        <p style={S.p}>
          前項保障方式應載明於本契約，且不得以任何方式限制甲方依本條規定所享有之權利。
        </p>

        <p style={S.artTitle}>第十八條（甲方之變更）</p>
        <p style={S.p}>
          甲方得將本契約所定之權利義務移轉予第三人，惟應事先取得乙方之書面同意。乙方非有正當理由，不得拒絕同意。
        </p>
        <p style={S.p}>
          第三人自乙方書面同意之日起，承受甲方依本契約之一切權利義務；原甲方依本契約所負之義務，同時免除。
        </p>

        <p style={S.artTitle}>第十九條（乙方之變更）</p>
        <p style={S.p}>
          乙方將依本契約所生之義務移轉予第三人（即業務承接業者）時，應事先以書面通知甲方，並提供與原乙方同等或更優之服務保障。
        </p>
        <p style={S.p}>
          甲方於接獲通知後十五日內，得書面表示不同意，並依第九條或第十條規定解除或終止本契約，乙方不得扣除解約手續費。
        </p>
        <p style={S.p}>
          甲方因乙方之業務承接業者之行為受有損害者，原乙方仍應與業務承接業者共同負賠償責任。
        </p>

        <p style={S.artTitle}>第二十條（個人資料保護）</p>
        <p style={S.p}>
          乙方因提供本契約服務，而蒐集、處理或利用甲方（含寵物）之個人資料，應依個人資料保護法及相關法令之規定辦理，非依甲方之書面同意或法令之規定，不得逾越服務目的之必要範圍使用。
        </p>
        <p style={S.p}>
          乙方應就蒐集之個人資料，採取適當之安全保護措施，防止未經授權之人員存取、利用或外洩。
        </p>
        <p style={S.p}>
          乙方違反本條規定，致甲方之個人資料遭外洩或受有其他損害者，應依法負賠償責任。
        </p>
        <p style={S.p}>
          甲方得依個人資料保護法規定，請求乙方查詢、提供複製、補充、更正或刪除甲方之個人資料。
        </p>

        <div style={S.pageNum}>— 6 —</div>
      </div>

      {/* ══ PAGE 7：條款第二十一條～第二十六條 ＋ 最終簽章 ══ */}
      <div style={S.page}>
        <p style={S.artTitle}>第二十一條（服務處所之選擇）</p>
        <p style={S.p}>
          乙方設有二以上之分支機構者，甲方得選擇任一分支機構接受服務，乙方不得拒絕或限制。
        </p>

        <p style={S.artTitle}>第二十二條（訂約後雙方合意變更契約）</p>
        <p style={S.p}>
          本契約經雙方合意，得以書面方式變更契約內容。
        </p>
        <p style={S.p}>
          前項書面應記載變更之具體事項、變更後之內容及甲乙雙方簽章，始生變更之效力。
        </p>
        <p style={S.p}>
          變更後之契約內容不得較原契約更不利於甲方；如有不利甲方之變更，乙方應具體說明差異，並以書面告知甲方，甲方書面同意後始生效力。
        </p>

        <p style={S.artTitle}>第二十三條（爭議之處理）</p>
        <p style={S.p}>
          甲乙雙方就本契約發生消費爭議時，得向直轄市或縣（市）消費爭議調解委員會申請調解，或依消費者保護法及其他法律規定主張相關權利。
        </p>
        <p style={S.p}>
          乙方不得拒絕接受主管機關之調查及消費爭議調解。
        </p>

        <p style={S.artTitle}>第二十四條（法院管轄）</p>
        <p style={S.p}>
          因本契約所生之訴訟，以乙方服務所在地之地方法院為第一審管轄法院，但甲方得依民事訴訟法之規定，主張其他具管轄權之法院。
        </p>

        <p style={S.artTitle}>第二十五條（契約書之分執保管）</p>
        <p style={S.p}>
          本契約一式二份，由甲乙雙方各執一份保管。乙方不得藉故收回甲方所執之契約書。
        </p>
        <p style={S.p}>
          本契約之電子版本（PDF 電子檔）與書面版本具有同等效力，依電子簽章法相關規定辦理。
        </p>

        <p style={S.artTitle}>第二十六條（其他協議事項）</p>
        <p style={S.p}>
          本契約未盡事宜，依有關法令、行政院消費者保護處之解釋及誠信原則辦理。
        </p>
        <p style={S.p}>
          其他特別協議事項如下；如與本契約條款衝突，以較有利甲方者優先適用：
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 2px' }}>
          一、寵物過敏及健康狀況：{petAllergies.length > 0 ? `${petName} 對「${allergyText}」有過敏史，服務前乙方應確認所用產品成分相容。` : `${petName} 無特殊過敏史，如服務過程發現異常反應，乙方應立即停止並告知甲方。`}
        </p>
        <p style={{ paddingLeft: '2em', margin: '0 0 10px' }}>
          二、其他協議事項（如無特別協議，本欄免填）：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
        </p>

        {/* 最終簽章 */}
        <div style={{ borderTop: '2px solid #000', paddingTop: '12px', marginTop: '4px' }}>
          <p style={{ textAlign: 'right' as const, marginBottom: '8px', fontSize: '10.5px' }}>{dateStr}</p>
          <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '11px' }}>立契約書人</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
            <tbody>
              <tr>
                <td style={{ width: '48%', verticalAlign: 'top' as const, paddingRight: '16px', borderRight: '1px solid #ccc' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>甲方（消費者）</p>
                  <p style={{ marginBottom: '2px' }}>姓名：{memberName}</p>
                  <p style={{ marginBottom: '2px' }}>電話：{memberPhone}</p>
                  <p style={{ marginBottom: '2px' }}>會員編號：{memberId}</p>
                  <p style={{ marginBottom: '6px' }}>地址：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</p>
                  <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>甲方簽章：</p>
                  <div style={{ height: '70px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '180px' }}>
                    {signatureData
                      ? <img src={signatureData} alt="甲方電子簽名" style={{ height: '68px', maxWidth: '178px', objectFit: 'contain' }} />
                      : <span style={{ color: '#aaa', fontSize: '9px' }}>（電子簽名）</span>
                    }
                  </div>
                </td>
                <td style={{ width: '4%' }} />
                <td style={{ width: '48%', verticalAlign: 'top' as const, paddingLeft: '16px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>乙方（美容業者）</p>
                  <p style={{ marginBottom: '2px' }}>名稱：{shopName}</p>
                  <p style={{ marginBottom: '2px' }}>電話：{shopPhone}</p>
                  <p style={{ marginBottom: '2px' }}>統一編號：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</p>
                  <p style={{ marginBottom: '6px' }}>營業所：{shopAddress}</p>
                  <p style={{ marginBottom: '4px', fontWeight: 'bold' }}>乙方簽章：</p>
                  <div style={{ width: '180px', height: '60px', borderBottom: '1px solid #000' }} />
                  <p style={{ marginTop: '4px', fontSize: '9.5px' }}>負責人姓名：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={S.pageNum}>— 7 —</div>
      </div>

      {/* ══ PAGE 8：附件—解除（終止）契約書範本 ══ */}
      <div style={S.page}>
        <p style={{ textAlign: 'center' as const, fontWeight: 'bold', fontSize: '14px', marginBottom: '24px', letterSpacing: '3px' }}>
          附件：解除（終止）契約書範本
        </p>

        <p style={{ marginBottom: '14px', fontSize: '11px', lineHeight: '2.0' }}>
          立書人（甲方）：<span style={S.ul}>{memberName}</span>，身分證統一編號：<span style={{ ...S.ul, minWidth: '160px' }}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</span>，
          依民法及消費者保護法相關規定，茲解除（終止）本人與
          <span style={S.ul}>{shopName}</span>（乙方）於中華民國<span style={S.ul}>&emsp;{roc}&emsp;</span>年&emsp;&emsp;月&emsp;&emsp;日所訂立之《寵物美容服務定型化契約書》，
          並請依本契約第&emsp;&emsp;條規定辦理退費事宜。
        </p>

        <p style={{ marginBottom: '6px', fontSize: '11px' }}>解除（終止）事由：</p>
        <p style={{ paddingLeft: '1em', fontSize: '10.5px', lineHeight: '1.9' }}>
          □ (一) 甲方任意解除（依第九條）<br />
          □ (二) 甲方任意終止（依第十條）<br />
          □ (三) 可歸責於乙方（依第十一條），事由：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<br />
          □ (四) 不可歸責雙方（依第十二條），事由：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<br />
          □ (五) 其他：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
        </p>

        <p style={{ marginTop: '16px', marginBottom: '6px', fontSize: '11px' }}>退費請求（依解除∕終止原因適用）：</p>
        <p style={{ paddingLeft: '1em', fontSize: '10.5px', lineHeight: '1.9' }}>
          已付金額：新臺幣&emsp;&emsp;&emsp;&emsp;元整<br />
          已接受服務費用：新臺幣&emsp;&emsp;&emsp;&emsp;元整<br />
          解約手續費（如適用）：新臺幣&emsp;&emsp;&emsp;&emsp;元整<br />
          應退還金額：新臺幣&emsp;&emsp;&emsp;&emsp;元整<br />
          退款方式：□ 現金　□ 匯款（帳號：&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;）
        </p>

        <div style={{ marginTop: '32px', fontSize: '11px', lineHeight: '2.2' }}>
          <p style={{ textAlign: 'right' as const }}>此致 <span style={S.ul}>{shopName}</span>（乙方）</p>
          <br />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', verticalAlign: 'top' as const, paddingRight: '16px' }}>
                  <p>立書人（甲方）：<span style={{ ...S.ul, minWidth: '120px' }}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</span>（簽章）</p>
                  <p>身分證統一編號：<span style={{ ...S.ul, minWidth: '140px' }}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</span></p>
                  <p>聯絡電話：<span style={{ ...S.ul, minWidth: '140px' }}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</span></p>
                  <p>聯絡地址：<span style={{ ...S.ul, minWidth: '200px' }}>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</span></p>
                </td>
                <td style={{ width: '50%', verticalAlign: 'top' as const, paddingLeft: '16px' }}>
                  <p>中華民國&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日</p>
                  <br />
                  <p style={{ fontSize: '9.5px', color: '#555' }}>
                    ※ 本書面得以郵寄、傳真、電子郵件或LINE等方式送達乙方，<br />
                    &emsp;建議保留寄送紀錄以供日後查對。
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '24px', padding: '10px', border: '1px dashed #999', fontSize: '9.5px', color: '#555' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>乙方收件回執（由乙方填寫）</p>
          <p>乙方名稱：{shopName}&emsp;收件日期：&emsp;&emsp;年&emsp;&emsp;月&emsp;&emsp;日&emsp;收件人員簽章：&emsp;&emsp;&emsp;&emsp;&emsp;</p>
          <p>退費處理期限：收件日起&emsp;&emsp;日內（依契約第九條／第十條／第十一條規定）</p>
        </div>

        <div style={S.pageNum}>— 8 —</div>
      </div>

    </div>
  )
})

ContractDocument.displayName = 'ContractDocument'
export default ContractDocument
