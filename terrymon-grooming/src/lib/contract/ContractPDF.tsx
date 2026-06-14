import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Image, Font,
} from '@react-pdf/renderer'
import type { ContractData } from './types'

// Microsoft JhengHei (微軟正黑體) — Windows Traditional Chinese system font
// postscriptName selects the specific font from the TTC collection; fontkit.open() reads via fs
Font.register({
  family: 'NotoSansTC',
  fonts: [
    { src: 'C:/Windows/Fonts/msjh.ttc',   postscriptName: 'MicrosoftJhengHeiRegular', fontWeight: 400 },
    { src: 'C:/Windows/Fonts/msjhbd.ttc', postscriptName: 'MicrosoftJhengHeiBold',    fontWeight: 700 },
  ],
})

const C = {
  primary:  '#2B7A4B',
  light:    '#F0F9F3',
  dark:     '#1A1D1A',
  gray:     '#5C6B5E',
  border:   '#D8E4DC',
  red:      '#A32D2D',
  redBg:    '#FEF2F2',
  stripe:   '#F8FBF8',
  white:    '#FFFFFF',
}

const styles = StyleSheet.create({
  page: {
    fontFamily:    'NotoSansTC',
    fontSize:      9,
    color:         C.dark,
    paddingTop:    28,
    paddingBottom: 28,
    paddingLeft:   36,
    paddingRight:  36,
    lineHeight:    1.5,
  },
  mainTitle: {
    fontSize:     15,
    color:        C.primary,
    textAlign:    'center',
    marginBottom: 4,
    fontWeight:   700,
  },
  govRef: {
    fontSize:     8,
    color:        C.gray,
    textAlign:    'center',
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1.5,
    borderBottomColor: C.primary,
    marginBottom:      8,
  },
  dividerLight: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    marginBottom:      6,
  },
  sectionTitle: {
    fontSize:     11,
    color:        C.primary,
    fontWeight:   700,
    marginTop:    10,
    marginBottom: 4,
  },
  clauseTitle: {
    fontSize:     9.5,
    color:        C.primary,
    fontWeight:   700,
    marginTop:    7,
    marginBottom: 2,
  },
  body: {
    fontSize:     9,
    color:        C.dark,
    marginBottom: 2,
    lineHeight:   1.5,
  },
  bodyIndent: {
    fontSize:     9,
    color:        C.dark,
    marginBottom: 2,
    lineHeight:   1.5,
    marginLeft:   12,
  },
  alertBox: {
    backgroundColor: C.redBg,
    borderRadius:    3,
    padding:         6,
    marginTop:       4,
    marginBottom:    4,
  },
  alertText: {
    fontSize:   9,
    color:      C.red,
    lineHeight: 1.5,
  },
  table: {
    marginBottom: 6,
  },
  tableRow: {
    flexDirection:     'row',
    borderBottomWidth: 0.4,
    borderBottomColor: C.border,
    borderLeftWidth:   0.4,
    borderLeftColor:   C.border,
  },
  tableHeader: {
    backgroundColor: C.primary,
  },
  tableRowStripe: {
    backgroundColor: C.stripe,
  },
  tableCell: {
    padding:          5,
    borderRightWidth: 0.4,
    borderRightColor: C.border,
    fontSize:         9,
    color:            C.dark,
  },
  tableCellLabel: {
    padding:          5,
    borderRightWidth: 0.4,
    borderRightColor: C.border,
    fontSize:         9,
    color:            C.primary,
    backgroundColor:  C.light,
    fontWeight:       700,
  },
  tableCellHeader: {
    padding:          5,
    borderRightWidth: 0.4,
    borderRightColor: C.border,
    fontSize:         9,
    color:            C.white,
  },
  signatureBox: {
    borderWidth:     1.5,
    borderColor:     C.primary,
    borderRadius:    4,
    backgroundColor: C.light,
    height:          90,
    justifyContent:  'center',
    alignItems:      'center',
    marginTop:       6,
    marginBottom:    6,
  },
  signatureImg: {
    width:     280,
    height:    80,
    objectFit: 'contain',
  },
  footer: {
    fontSize:   7.5,
    color:      C.gray,
    textAlign:  'center',
    lineHeight: 1.4,
  },
  pageNum: {
    position: 'absolute',
    bottom:   14,
    right:    36,
    fontSize: 8,
    color:    C.gray,
  },
})

const Divider = ({ heavy = false }: { heavy?: boolean }) => (
  <View style={heavy ? styles.divider : styles.dividerLight} />
)

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{'■'} {children}</Text>
)

const ClauseTitle = ({ num, title }: { num: string; title: string }) => (
  <Text style={styles.clauseTitle}>{`第 ${num} 條（${title}）`}</Text>
)

const Body = ({ children, indent = false }: { children: string; indent?: boolean }) => (
  <Text style={indent ? styles.bodyIndent : styles.body}>{children}</Text>
)

const AlertBox = ({ children }: { children: string }) => (
  <View style={styles.alertBox}>
    <Text style={styles.alertText}>{children}</Text>
  </View>
)

const InfoTable = ({
  rows,
  widths,
  hasHeader = false,
  labelCols = [0],
}: {
  rows:       string[][]
  widths:     number[]
  hasHeader?: boolean
  labelCols?: number[]
}) => (
  <View style={styles.table}>
    <View style={{ borderTopWidth: 0.4, borderTopColor: C.border }} />
    {rows.map((row, ri) => (
      <View
        key={ri}
        style={[
          styles.tableRow,
          hasHeader && ri === 0 ? styles.tableHeader : {},
          !hasHeader && ri % 2 === 1 ? styles.tableRowStripe : {},
        ]}
      >
        {row.map((cell, ci) => {
          const isLabel      = !hasHeader && labelCols.includes(ci)
          const isHeaderCell = hasHeader && ri === 0
          const w = widths[ci] ?? 60
          const cellStyle = isHeaderCell
            ? styles.tableCellHeader
            : isLabel
            ? styles.tableCellLabel
            : styles.tableCell
          return (
            <View key={ci} style={[cellStyle, { width: w }]}>
              <Text>{cell}</Text>
            </View>
          )
        })}
      </View>
    ))}
  </View>
)

export default function ContractPDF({ data }: { data: ContractData }) {
  const now        = new Date(data.signedAt || new Date().toISOString())
  const rocY       = now.getFullYear() - 1911
  const month      = now.getMonth() + 1
  const day        = now.getDate()
  const dateStr    = `中華民國 ${rocY} 年 ${month} 月 ${day} 日`
  const dateTimeStr = now.toLocaleString('zh-TW')

  const allergyText = data.petAllergies.length
    ? data.petAllergies.join('、')
    : '無'
  const hasAllergy = data.petAllergies.length > 0

  const servicesDisplay = data.services.map(s => s.name).join('、')

  const svcRows: string[][] = [
    ['服務項目', '單價（元）', '次數', '小計（元）', '期間'],
    ...data.services.map(s => [
      s.name,
      s.price.toLocaleString(),
      String(s.qty),
      (s.price * s.qty).toLocaleString(),
      s.period,
    ]),
    ['', '', '', '合計', `NT$ ${data.totalPrice.toLocaleString()} 元`],
  ]

  return (
    <Document
      title="寵物美容定型化契約書"
      author={data.storeName}
      creator="TerryMon 寵物服務平台"
    >
      {/* ====== Page 1: Cover + Info + Services ====== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>{'寵物美容定型化契約書'}</Text>
        <Text style={styles.govRef}>
          {'衛生福利部 112 年 6 月 8 日衛授疾字第 1120300459 號函發布'}
        </Text>
        <Divider heavy />

        <Body>
          {`本契約於${dateStr}由甲方攜回審閱（審閱期間至少三日）`}
        </Body>

        <InfoTable
          rows={[
            ['消費者姓名（甲方）', data.memberName],
            ['美容業者名稱（乙方）', data.storeName],
          ]}
          widths={[120, 360]}
        />

        <InfoTable
          rows={[['甲方簽章', '（電子簽名見第三頁）', '乙方簽章', `${data.storeName}（章）`]]}
          widths={[72, 156, 72, 180]}
        />

        <SectionTitle>{'消費者（甲方）資料'}</SectionTitle>
        <InfoTable
          rows={[
            ['姓名', data.memberName, '出生年月日', data.memberBirth],
            ['會員編號', data.memberId, '電話', data.memberPhone],
            ['住居所', data.memberAddress, '', ''],
            ['法定代理人', data.memberLegal || '（未填寫）', '', ''],
          ]}
          widths={[60, 156, 60, 204]}
        />

        <SectionTitle>{'美容業者（乙方）資料'}</SectionTitle>
        <InfoTable
          rows={[
            ['名稱', data.storeName, '代表人', data.storeOwner],
            ['電話', data.storePhone, '統一編號', data.storeTaxId],
            ['營業所', data.storeAddress, '', ''],
            ['締約職員', data.groomerName, '簽約地點', data.signLocation],
          ]}
          widths={[60, 156, 60, 204]}
        />

        <SectionTitle>{'服務寵物'}</SectionTitle>
        <InfoTable
          rows={[
            ['寵物名稱', data.petName, '品種', data.petBreed],
            ['體重', `${data.petWeight} kg`, '過敏史', allergyText],
          ]}
          widths={[60, 156, 60, 204]}
        />
        {hasAllergy && (
          <AlertBox>
            {`⚠️ 過敏警告：${data.petName} 對「${allergyText}」有過敏史，請確認所有使用產品均不含上述過敏原。`}
          </AlertBox>
        )}

        <SectionTitle>{'服務內容'}</SectionTitle>
        <InfoTable rows={svcRows} widths={[168, 60, 36, 72, 144]} hasHeader />

        <SectionTitle>{'收取金額'}</SectionTitle>
        <InfoTable
          rows={[
            ['入會費', `NT$ ${data.memberFee.toLocaleString()} 元（非會員免收）`,
             '服務費用', `NT$ ${data.totalPrice.toLocaleString()} 元`],
            ['儲值折抵', `NT$ ${data.balanceUsed.toLocaleString()} 元`,
             '刷卡金額', `NT$ ${data.cardAmount.toLocaleString()} 元`],
            ['合計', `NT$ ${data.totalPrice.toLocaleString()} 元`, '', ''],
          ]}
          widths={[60, 156, 60, 204]}
        />

        <SectionTitle>{'支付方法'}</SectionTitle>
        {data.balanceUsed > 0 && (
          <Body>{`✓ 儲值餘額折抵：NT$ ${data.balanceUsed.toLocaleString()} 元`}</Body>
        )}
        {data.cardAmount > 0 && (
          <Body>{`✓ 信用卡支付：NT$ ${data.cardAmount.toLocaleString()} 元　刷卡日期：${dateStr}`}</Body>
        )}
        {data.balanceUsed === 0 && data.cardAmount === 0 && (
          <Body>{`✓ 現金支付：NT$ ${data.totalPrice.toLocaleString()} 元　支付日期：${dateStr}`}</Body>
        )}

        <View style={{ marginTop: 6 }}>
          <Body>{`預定實施日：${dateStr}`}</Body>
          <Body>{`書面契約交付日：${dateStr}`}</Body>
        </View>

        <Text style={styles.pageNum}>{'第 1 頁，共 3 頁'}</Text>
      </Page>

      {/* ====== Page 2: 26 Articles ====== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>{'寵物美容定型化契約條款'}</Text>
        <Divider heavy />
        <Body>{'甲乙雙方同意就美容契約事項依下列約定辦理：'}</Body>

        <ClauseTitle num={'一'} title={'美容之定義與服務範圍'} />
        <Body>{'本契約乙方所提供之寵物美容服務項目包含：'}</Body>
        <Body indent={true}>{'✓ 寵物沐浴梳理　✓ 寵物造型修剪　□ 護膚護毛處理　✓ 耳道清潔'}</Body>
        <Body indent={true}>{'□ 趾甲修剪磨圓　□ 肛門腺清潔　□ 相關商品之販賣　□ 其他'}</Body>
        <Body>{`本次服務項目：${servicesDisplay}`}</Body>

        <ClauseTitle num={'二'} title={'權利義務之依據'} />
        <Body>{'甲乙雙方關於本件美容之權利義務，依本契約條款之約定定之；本契約未約定者，依有關法令及誠信原則定之。'}</Body>
        <Body>{'本契約之附件、乙方之廣告及本契約當事人間之口頭約定，均為本契約內容之一部分。'}</Body>
        <Body>{'甲乙雙方之其他特別協議事項，其效力優於本契約條款。'}</Body>

        <ClauseTitle num={'三'} title={'會員權利義務之說明'} />
        <Body>{'甲方如有需要，得申請成為乙方之會員，其權利義務依會員規約之規定，雙方其他權利義務並得以書面約定之。'}</Body>
        <Body>{'會員就相同美容項目所得享受之權利，不得低於非會員，所負擔之義務，不得高於非會員。'}</Body>
        <Body>{'如發行會員卡者，會員卡不慎遺失、毀損或被竊時，乙方於甲方申請補發後，應製作補發新卡，並得酌收製卡工本費（不得逾新臺幣一百元）。'}</Body>

        <ClauseTitle num={'四'} title={'繼續性美容服務、項目及方式之說明'} />
        <Body>{'乙方應將甲方得接受美容實施之條件及甲方所選擇之美容項目、對價、計價方式、次數、期間、效果分析、副作用、危險性等，於訂約前向甲方為充分明確之說明，並提供相關之書面。'}</Body>
        <Body>{'乙方應將為甲方提供服務內容及使用之商品，製作紀錄並經甲方簽名確認後，自契約終止或解除翌日起保留至少二年，並提供甲方紀錄影本，以供查對。'}</Body>
        <Body>{'前項乙方提供甲方之紀錄影本，得以書面、電子或其他適當之方法為之。'}</Body>

        <ClauseTitle num={'五'} title={'乙方之詢問及處置義務'} />
        <Body>{'乙方於實施美容項目前，應詢問、確認甲方寵物有無因患疾現正治療中、是否屬過敏性體質、現有無服用何種藥物、毛髮皮膚有無敏感性及其他不利於接受美容之事項。甲方對於乙方之詢問應誠實告知。'}</Body>
        <Body>{'前項詢問，應以書面為之，並經甲方簽名確認後保留至少二年，並提供甲方紀錄影本，以供查對。'}</Body>
        <Body>{'於甲方接受繼續性美容服務，任一方發現甲方寵物身體狀況有異樣或實施之部位有異常現象時，應即告知他方。乙方除應即中止實施外，並有義務採取適當之處理措施。'}</Body>
        {hasAllergy && (
          <AlertBox>
            {`⚠️ 本次服務特別注意：${data.petName} 對「${allergyText}」有過敏史，乙方應確認所有使用產品及藥品均不含上述過敏原。`}
          </AlertBox>
        )}

        <ClauseTitle num={'六'} title={'費用明確性原則'} />
        <Body>{`本契約之總費用（含所需商品、材料費、服務費）共計新臺幣 ${data.totalPrice.toLocaleString()} 元整，其細目如第一頁服務內容表所示。`}</Body>
        <Body>{'繳費項目未明列者，乙方不得向甲方收取。'}</Body>
        <Body>{'甲方因繳費而獲得乙方贈送之商品（價值不得逾總費用百分之二十），於契約終止或解除時，乙方不得向甲方請求返還該贈品。'}</Body>

        <ClauseTitle num={'七'} title={'價金金額與付款方式'} />
        <Body>{`甲方應給付價金金額為：新臺幣 ${data.totalPrice.toLocaleString()} 元整。`}</Body>
        <Body>{`本次付款方式：${data.paymentMethod}。`}</Body>
        <Body>{'信用卡刷卡手續費應由乙方負擔。'}</Body>

        <ClauseTitle num={'八'} title={'卡、憑證之使用'} />
        <Body>{'乙方如以會員卡或其他類似方式作為提供服務之憑證者，應將其使用方式、服務內容、使用時段、使用地點、使用次數及服務可使用之期間等項目，載明於卡、憑證之上，並向甲方為明確說明。'}</Body>

        <ClauseTitle num={'九'} title={'實施前，甲方任意解除契約之退費規定'} />
        <Body>{`甲方於繼續性美容服務實施前因甲方任意解除本契約者，乙方應於解約日後 ${data.refundDaysPre} 日內（不得逾十五日）將已收取之費用扣除解約手續費後退還於甲方。`}</Body>
        <Body>{`前項所稱解約手續費，指本契約總費用百分之 ${data.cancelPct}（其最高金額不得逾本契約總費用百分之五）。`}</Body>

        <ClauseTitle num={'十'} title={'實施後，甲方任意終止契約之退費規定'} />
        <Body>{`甲方於繼續性美容服務實施後因甲方任意終止本契約者，乙方應於終止日後 ${data.refundDaysPost} 日內（不得逾三十日）將已繳全部費用扣除已接受服務之費用，並再扣除解約手續費後退還於甲方。`}</Body>
        <Body>{'前項扣除已接受服務之費用，依簽約時每次服務費用乘以實際使用次數計算。'}</Body>
        <Body>{`前項所稱解約手續費，指剩餘金額百分之 ${data.terminatePct}（其最高金額不得逾百分之十）。`}</Body>

        <ClauseTitle num={'十一'} title={'可歸責於乙方，甲方解除或終止契約之退費規定'} />
        <Body>{'乙方未經甲方之同意，將本契約之全部或部分委由其分支機構或其他美容業者代為履行，或變更服務地點，或甲方書面指定之美容服務人員離職或其他可歸責於乙方事由，甲方得解除或終止本契約。'}</Body>
        <Body>{'乙方應依第九條或第十條之計算約定退費予甲方，但不得扣除解約手續費；並應額外賠償予甲方依第九條或第十條約定之解約手續費。'}</Body>

        <ClauseTitle num={'十二'} title={'不可歸責於雙方，解除或終止契約之退費規定'} />
        <Body>{'有下列事由之一者，雙方或甲方繼承人得於繼續性美容服務實施前解除或實施後終止本契約之全部或一部：'}</Body>
        <Body indent={true}>{'一、因天災、戰亂、政府法令、罷工等不可抗力或不可歸責於乙方之事由，致不能履行債務。'}</Body>
        <Body indent={true}>{'二、甲方因死亡、疾病、健康情形不佳或遷移他處，致難以繼續接受本契約之服務。'}</Body>
        <Body>{'前項情形，乙方應依第九條或第十條約定退還費用予甲方，但不得扣除解約手續費。'}</Body>

        <ClauseTitle num={'十三'} title={'終止契約後乙方之附隨義務'} />
        <Body>{'甲方於實施繼續性美容服務後，本契約終止者，乙方就有關甲方寵物之生命、身體或健康等事項，於二年內仍有義務為必要之告知、協助及交付第四條、第五條之紀錄。'}</Body>

        <ClauseTitle num={'十四'} title={'解除或終止契約之方式'} />
        <Body>{'甲乙雙方得以書面或口頭方式向他方為解除或終止契約之意思表示。'}</Body>
        <Body>{'以書面解除或終止契約時，其範本參照第三頁附件。'}</Body>

        <ClauseTitle num={'十五'} title={'甲方受領服務之預約'} />
        <Body>{'甲方受領美容服務，應於事先約定預約方式，如未約定則為不需預約。'}</Body>
        <Body>{'甲方如無法依約定時間參加美容服務，應依約定方式於一定時間內事先通知乙方。'}</Body>
        <Body>{'甲方遲延受領美容服務，乙方因此所增加之費用，由甲方負擔。'}</Body>

        <ClauseTitle num={'十六'} title={'擔保條款'} />
        <Body>{'乙方就本次服務品質及寵物安全負擔保責任，如因乙方操作疏失造成寵物傷害，乙方應負賠償責任。'}</Body>
        <Body>{'乙方應確保使用之美容產品符合安全標準，不含甲方告知之過敏原。'}</Body>

        <ClauseTitle num={'十七'} title={'乙方履約保障'} />
        <Body>{'乙方承諾依本契約所定服務項目、品質及時間確實履行。'}</Body>
        <Body>{'如甲方預付金額逾新臺幣五萬元者，乙方應就超過金額之部分，依相關法令提供履約保障。'}</Body>

        <ClauseTitle num={'十八'} title={'甲方之變更'} />
        <Body>{'甲方經乙方之同意後，得將其依本契約所應承受負擔之權利義務移轉予第三人。'}</Body>

        <ClauseTitle num={'十九'} title={'乙方之變更'} />
        <Body>{'乙方經甲方之同意後，得將依本契約所生之權利義務讓與其他美容業者。'}</Body>
        <Body>{'前項情形，甲方於不同意時得解除或終止契約，乙方於退費時不得扣除解約手續費。'}</Body>

        <ClauseTitle num={'二十'} title={'個人資料保護'} />
        <Body>{'乙方因甲方參加本契約之美容服務，而知悉或持有甲方所參加之服務內容、紀錄或其他相關個人資料，應予保密並依個人資料保護法相關規定辦理。'}</Body>
        <Body>{'乙方違反前項規定致甲方受有損害者，應負賠償責任。'}</Body>

        <ClauseTitle num={'二十一'} title={'服務處所之選擇'} />
        <Body>{'甲方得於乙方之分支機構接受美容服務（如有設立）。'}</Body>

        <ClauseTitle num={'二十二'} title={'訂約後雙方合意變更契約'} />
        <Body>{'甲乙雙方於契約訂定後，得合意變更契約內容。但變更後之內容更不利於甲方者，乙方應向甲方詳細說明變更前後之差異，並經甲方書面確認同意，始發生變更契約之效力。'}</Body>

        <ClauseTitle num={'二十三'} title={'爭議之處理'} />
        <Body>{'甲乙雙方就本契約發生消費爭議時，甲方得依消費者保護法之規定，為申訴、申請調解或提起消費訴訟。'}</Body>
        <Body>{'消費者服務專線：1950（行政院消費者保護專線）'}</Body>

        <ClauseTitle num={'二十四'} title={'法院管轄'} />
        <Body>{`因本契約所生之訴訟，甲乙雙方同意以${data.court}地方法院為第一審管轄法院，但甲方得主張由消費關係發生地之地方法院管轄。`}</Body>

        <ClauseTitle num={'二十五'} title={'契約書之分執保管'} />
        <Body>{'本契約一式二份，應由甲乙雙方分執保管，乙方不得藉故收回。'}</Body>
        <Body>{'本電子合約經甲方電子簽名確認，具有與書面契約相同之法律效力。'}</Body>

        <ClauseTitle num={'二十六'} title={'其他協議事項'} />
        <Body>{`一、${data.specialNotes || '無。'}`}</Body>
        <Body>{'二、無。'}</Body>
        <Body>{'三、無。'}</Body>

        <Text style={styles.pageNum}>{'第 2 頁，共 3 頁'}</Text>
      </Page>

      {/* ====== Page 3: Signature + Termination Template ====== */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>{'簽署確認'}</Text>
        <Divider heavy />
        <Body>{'本契約一式二份，甲乙雙方各執一份保管。甲方已詳閱並同意以上所有條款。'}</Body>

        <InfoTable
          rows={[
            ['', '甲方（消費者）', '乙方（美容業者）'],
            ['姓名',     data.memberName,  data.storeName],
            ['電話',     data.memberPhone, data.storePhone],
            ['住居所',   data.memberAddress, data.storeAddress],
            ['簽約日期', dateStr,           dateStr],
            ['統一編號', '（個人）',         data.storeTaxId],
            ['簽章',     '（電子簽名如下）', `${data.storeName}（章）`],
          ]}
          widths={[72, 216, 192]}
          hasHeader
        />

        <SectionTitle>{'甲方電子簽名'}</SectionTitle>
        <Body>{`甲方已於 ${dateTimeStr} 透過 TerryMon 系統完成電子簽名，確認已詳閱並同意本契約全部條款。`}</Body>

        {data.signatureUrl ? (
          <Image src={data.signatureUrl} style={styles.signatureImg} />
        ) : (
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 9, color: C.gray }}>{'（電子簽名圖）'}</Text>
          </View>
        )}

        <Body>{`電子簽名時間戳記：${dateTimeStr}`}</Body>
        <Body>{`TerryMon 系統交易序號：${data.memberId}-${rocY}${month}${day}`}</Body>

        <Divider />

        <SectionTitle>{'附件：美容契約解除／終止契約書範本'}</SectionTitle>
        <Body>{`本人＿＿＿＿＿＿＿ 於民國＿＿年＿＿月＿＿日與`}</Body>
        <Body>{`貴公司（商號）${data.storeName}（美容業者）所締結之契約，茲依美容定型化契約之約定 □解除 ／ □終止 之。`}</Body>
        <Body>{'貴公司應退本人之金額新臺幣＿＿＿＿＿元，請於一個月內支付現金、票據或匯入下列之銀行帳號。'}</Body>

        <View style={{ marginTop: 8 }}>
          <InfoTable
            rows={[
              ['銀行名稱', '　　　　　　　　', '分行', '　　　　　　'],
              ['存款帳號', '　　　　　　　　　　　　　　', '', ''],
              ['戶　　名', '　　　　　　　　　　　　　　', '', ''],
            ]}
            widths={[60, 156, 48, 216]}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <Body>{'又本人所購買寄存於貴公司之未退還商品，請許可領回。'}</Body>
          <View style={{ marginTop: 12 }}>
            <Body>{'原立契約書人（解除契約／終止契約人）：＿＿＿＿＿＿＿＿＿'}</Body>
            <Body>{'住址：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'}</Body>
            <Body>{`此致 ${data.storeName} 負責人 台端`}</Body>
          </View>
        </View>

        <Divider />

        <Text style={styles.footer}>
          {`本契約依衛生福利部公告之美容定型化契約範本製作，具有相同之法律效力。\n由 ${data.storeName} 於 ${dateTimeStr} 透過 TerryMon 寵物服務平台系統產生。`}
        </Text>

        <Text style={styles.pageNum}>{'第 3 頁，共 3 頁'}</Text>
      </Page>
    </Document>
  )
}
