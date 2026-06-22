import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const TOTAL_TIME = 60

const ALL_ITEMS = {
  'テント':           '⛺',
  'タープ':           '🏕️',
  '寝袋':             '🛌',
  'マット':           '🟫',
  'ランタン':         '🏮',
  '焚き火台':         '🔥',
  '火ばさみ':         '🔧',
  'レインウェア':     '🧥',
  'クーラーボックス': '🧊',
  '救急セット':       '🩺',
  'シュノーケル':     '🤿',
  '扇風機':           '🌀',
  'スノーボード':     '🏂',
  '釣り竿':           '🎣',
  'ハンモック':       '🏖️',
  'サンダル':         '🩴',
  '日焼け止め':       '🧴',
  '水着':             '👙',
  '防水シート':       '🛡️',
  '厚手の上着':       '🧣',
  '虫よけスプレー':   '🪲',
  'キャンプチェア':   '🪑',
  'ポータブル扇風機': '💨',
  '帽子':             '👒',
}

// Each item belongs to a storage area
const ITEM_STORAGE = {
  'テント':           'camp-shelf',
  'タープ':           'camp-shelf',
  '寝袋':             'camp-shelf',
  'マット':           'camp-shelf',
  'ランタン':         'camp-shelf',
  '焚き火台':         'camp-shelf',
  '火ばさみ':         'camp-shelf',
  'キャンプチェア':   'camp-shelf',
  'ハンモック':       'camp-shelf',
  '防水シート':       'outdoor-box',
  '虫よけスプレー':   'outdoor-box',
  '救急セット':       'outdoor-box',
  'シュノーケル':     'outdoor-box',
  '釣り竿':           'outdoor-box',
  'スノーボード':     'outdoor-box',
  'レインウェア':     'clothes-case',
  '厚手の上着':       'clothes-case',
  '水着':             'clothes-case',
  'サンダル':         'clothes-case',
  '帽子':             'clothes-case',
  'クーラーボックス': 'food-cold',
  '日焼け止め':       'food-cold',
  'ポータブル扇風機': 'food-cold',
  '扇風機':           'food-cold',
}

const STORAGE_AREAS = [
  { id: 'camp-shelf',   emoji: '🪵', name: 'キャンプ棚',        color: '#2d6a4f' },
  { id: 'outdoor-box',  emoji: '📦', name: 'アウトドアボックス', color: '#7c5c2e' },
  { id: 'clothes-case', emoji: '👕', name: '衣類ケース',         color: '#1565c0' },
  { id: 'food-cold',    emoji: '🧺', name: '食材・保冷エリア',   color: '#6a1b9a' },
]

// Character x positions (%) per active area
const CHAR_X = {
  'idle':         '46%',
  'camp-shelf':   '18%',
  'outdoor-box':  '70%',
  'clothes-case': '18%',
  'food-cold':    '70%',
  'car-trunk':    '46%',
}

// ===== Missions (per scenario) =====
const MISSIONS = {
  'spring-family': [
    {
      id: 'spring-rain',
      text: '急な雨に備えよう',
      extraRequired: ['防水シート'],
      extraReasons: {
        '防水シート': '追加ミッション「急な雨に備えよう」への対応として必要でした。テントの下に敷くことで急な雨による地面からの水分の侵入を防げます。',
      },
    },
    {
      id: 'spring-cold-kids',
      text: '子どもの防寒を優先しよう',
      extraRequired: ['厚手の上着'],
      extraReasons: {
        '厚手の上着': '追加ミッション「子どもの防寒を優先しよう」への対応として必要でした。子どもは体温調節が苦手なため、夜の冷え込みに備えた防寒着が欠かせません。',
      },
    },
    {
      id: 'spring-bugs',
      text: '虫対策も忘れずに',
      extraRequired: ['虫よけスプレー'],
      extraReasons: {
        '虫よけスプレー': '追加ミッション「虫対策も忘れずに」への対応として必要でした。春のキャンプでも虫の活動が活発な時期があり、子どもへの虫対策は重要です。',
      },
    },
  ],
  'summer-beach': [
    {
      id: 'summer-snorkel',
      text: '海遊びを楽しもう',
      extraRequired: ['シュノーケル'],
      extraReasons: {
        'シュノーケル': '追加ミッション「海遊びを楽しもう」への対応として必要でした。海の中を泳いで楽しむためにシュノーケルを持参しましょう。',
      },
    },
    {
      id: 'summer-sun',
      text: '強い日差しに備えよう',
      extraRequired: ['帽子'],
      extraReasons: {
        '帽子': '追加ミッション「強い日差しに備えよう」への対応として必要でした。強い日差しから頭部を直接守り、熱中症リスクを下げるために帽子が有効です。',
      },
    },
    {
      id: 'summer-bugs',
      text: '夜の虫対策も必要',
      extraRequired: ['虫よけスプレー'],
      extraReasons: {
        '虫よけスプレー': '追加ミッション「夜の虫対策も必要」への対応として必要でした。夏の海辺では夜になると虫が多く活動します。',
      },
    },
  ],
  'autumn-rain': [
    {
      id: 'autumn-wind',
      text: '強風に備えよう',
      extraRequired: ['キャンプチェア'],
      extraReasons: {
        'キャンプチェア': '追加ミッション「強風に備えよう」への対応として必要でした。雨の中で地面に直接座ると体温が急速に奪われます。チェアを使うことで冷えを防ぎながら安全に過ごせます。',
      },
    },
    {
      id: 'autumn-morning-cold',
      text: '朝はさらに冷え込む予報',
      extraRequired: ['厚手の上着'],
      extraReasons: {
        '厚手の上着': '追加ミッション「朝はさらに冷え込む予報」への対応として特に重要でした。想定以上の冷え込みに備えて、厚手の上着を必ず持参しましょう。',
      },
    },
    {
      id: 'autumn-mud',
      text: 'テント周辺のぬかるみ対策',
      extraRequired: ['防水シート'],
      extraReasons: {
        '防水シート': '追加ミッション「テント周辺のぬかるみ対策」への対応として特に重要でした。雨でぬかるんだ地面での活動を快適にするために防水シートが役立ちます。',
      },
    },
  ],
}

// ===== Scenarios =====
const SCENARIOS = [
  {
    id: 'spring-family',
    emoji: '🌸',
    name: '春のファミリーキャンプ',
    difficulty: 2,
    conditions: [
      { icon: '📅', text: '1泊2日' },
      { icon: '👨‍👩‍👧‍👦', text: '大人4人・子ども2人' },
      { icon: '🌡️', text: '夜は8℃' },
      { icon: '☔', text: '雨の可能性あり' },
      { icon: '🔥', text: '焚き火あり' },
      { icon: '🚗', text: '車で移動' },
    ],
    required: [
      'テント', 'タープ', '寝袋', 'マット', 'ランタン',
      '焚き火台', '火ばさみ', 'レインウェア', 'クーラーボックス', '救急セット',
    ],
    itemNames: [
      'テント', 'タープ', '寝袋', 'マット', 'ランタン',
      '焚き火台', '火ばさみ', 'レインウェア', 'クーラーボックス', '救急セット',
      'シュノーケル', '扇風機', 'スノーボード', '釣り竿', 'ハンモック',
    ],
    campPoint: '春は昼と夜の寒暖差に注意。雨対策と子ども用の備えが安心につながります。',
    requiredReasons: {
      'テント':           '宿泊の中心となるシェルターです。夜の冷え込みや急な雨から家族全員を守るために欠かせません。',
      'タープ':           '雨の可能性があるため、食事や調理スペースを屋根から守るのに必要です。ファミリーキャンプでは作業スペースとしても重宝します。',
      '寝袋':             '夜は8℃まで下がるため、体を温めて快適に眠るために必要です。毛布だけでは保温が足りない場面があります。',
      'マット':           '地面の硬さと冷気を遮断します。直接地面に寝ると体が冷えてしまうため、快適な睡眠のために欠かせません。',
      'ランタン':         '夜のテント内外を照らします。子どもがいる場合は転倒防止や夜間のトイレ移動のためにも安全のために必要です。',
      '焚き火台':         '地面に直接火を起こすと自然を傷めます。焚き火台を使うことで安全に暖をとり、家族で調理を楽しめます。',
      '火ばさみ':         '焚き火中に薪や炭を安全に動かすために必要です。素手では火傷のリスクがあります。',
      'レインウェア':     '雨の可能性があるため必要です。濡れたままだと体温が急激に下がり、夜は特に体が冷えやすくなります。',
      'クーラーボックス': '食材を新鮮に保つために必要です。子どもがいる場合、食中毒予防の観点からも温度管理は重要です。',
      '救急セット':       'アウトドアでは虫刺されや小さなケガが起きやすいです。子ども連れでは素早く対処できる備えがあると安心です。',
    },
    unnecessaryReasons: {
      'シュノーケル': '春のキャンプ場は水温が低く、シュノーケリングには向かない季節です。今回の条件には水遊びも含まれていません。',
      '扇風機':       '夜の気温が8℃と寒い春キャンプでは、暑さ対策より防寒対策が優先されます。荷物を軽くするために省いても問題ありません。',
      'スノーボード': '雪山で使う道具のため、春のキャンプ場では使用できません。持って行くと大きな荷物になるだけです。',
      '釣り竿':       '今回のシナリオには釣りの条件が含まれていません。荷物を減らしたい場合は優先度を下げられます。',
      'ハンモック':   'あると便利な場面もありますが、今回は必須ではありません。設置に手間がかかるため、初めてのファミリーキャンプでは省いても大丈夫です。',
    },
  },
  {
    id: 'summer-beach',
    emoji: '🌊',
    name: '夏の海辺ソロキャンプ',
    difficulty: 1,
    conditions: [
      { icon: '📅', text: '1泊2日' },
      { icon: '🧍', text: '大人1人' },
      { icon: '🌡️', text: '日中は32℃' },
      { icon: '🌊', text: '海辺' },
      { icon: '🚫', text: '焚き火なし' },
      { icon: '🚗', text: '車で移動' },
    ],
    required: [
      'テント', '寝袋', 'マット', 'ランタン', 'クーラーボックス',
      'レインウェア', '救急セット', 'サンダル', '日焼け止め', '水着',
    ],
    itemNames: [
      'テント', '寝袋', 'マット', 'ランタン', 'クーラーボックス',
      'レインウェア', '救急セット', 'サンダル', '日焼け止め', '水着',
      'タープ', '焚き火台', '火ばさみ', '厚手の上着', 'スノーボード',
    ],
    campPoint: '海辺は日差しと水分対策が重要。日焼け止めや水着も忘れずに準備しましょう。',
    requiredReasons: {
      'テント':           '宿泊場所として欠かせません。海辺は風が強くなることもあり、テントがあることで風雨から身を守れます。',
      '寝袋':             '夏でも夜は気温が下がります。海風は体感温度を下げるため、薄手でも寝袋があると快適に眠れます。',
      'マット':           '砂浜や硬い地面での就寝には、地面の硬さと湿気対策として必要です。快適な睡眠のために欠かせません。',
      'ランタン':         '夜のテントや周辺を照らします。海辺は特に暗くなりやすく、足元の安全確認にも必要です。',
      'クーラーボックス': '夏の高温下では食材や飲み物が傷みやすいです。熱中症予防の冷たい飲み物を確保するためにも必携です。',
      'レインウェア':     '海辺は天気が変わりやすく、急な雨に備えて持っておくと安心です。濡れると体温が下がるリスクがあります。',
      '救急セット':       '海辺では岩場でのケガや日焼けによる肌トラブルへの対処が必要な場面があります。ソロキャンプでは特に自己対処できる備えが重要です。',
      'サンダル':         '砂浜や海の中を歩く際に、貝殻や岩からの足の保護に必要です。素足での移動はケガのリスクがあります。',
      '日焼け止め':       '夏の強い日差しは肌へのダメージだけでなく、熱中症リスクも高めます。こまめに塗り直すことが大切です。',
      '水着':             '海辺キャンプで海に入るために必要です。水着なしでは海を思い切り楽しめません。',
    },
    unnecessaryReasons: {
      'タープ':       'ソロキャンプのため、テント1つで十分なスペースが確保できます。荷物を減らしたい場合は省いても問題ありません。',
      '焚き火台':     '今回のシナリオでは焚き火なしの設定です。海辺では焚き火が禁止されているキャンプ場も多く、必要ありません。',
      '火ばさみ':     '焚き火をしないため、今回は不要です。荷物を軽くするために省けます。',
      '厚手の上着':   '夏の海辺は日中32℃と暑いため、厚手の上着は必要ありません。軽い羽織物があれば十分です。',
      'スノーボード': '夏の海辺では全く使用しない道具です。持って行くと大きな荷物になるだけです。',
    },
  },
  {
    id: 'autumn-rain',
    emoji: '🍂',
    name: '秋の雨キャンプ',
    difficulty: 3,
    conditions: [
      { icon: '📅', text: '1泊2日' },
      { icon: '👫', text: '大人2人' },
      { icon: '🌡️', text: '夜は5℃' },
      { icon: '🌧️', text: '雨が強い予報' },
      { icon: '🔥', text: '焚き火あり' },
      { icon: '🚗', text: '車で移動' },
    ],
    required: [
      'テント', 'タープ', '寝袋', 'マット', 'ランタン',
      '焚き火台', '火ばさみ', 'レインウェア', 'クーラーボックス', '救急セット',
      '防水シート', '厚手の上着',
    ],
    itemNames: [
      'テント', 'タープ', '寝袋', 'マット', 'ランタン',
      '焚き火台', '火ばさみ', 'レインウェア', 'クーラーボックス', '救急セット',
      '防水シート', '厚手の上着', '虫よけスプレー', '水着', 'サンダル',
    ],
    campPoint: '雨と低温が重なるキャンプでは、防水対策と防寒装備が快適さを左右します。',
    requiredReasons: {
      'テント':           '宿泊場所として必須です。雨の日でも安心して眠れるよう、防水性の高いテントを用意しましょう。',
      'タープ':           '雨が強い予報のため、食事や調理スペースを雨から守るために必須です。快適なキャンプ空間の確保に欠かせません。',
      '寝袋':             '夜は5℃まで下がります。低温では薄い寝袋では眠れないことがあるため、十分な保温力のある寝袋が必要です。',
      'マット':           '雨で冷えた地面から断熱するために必要です。マットがないと体の熱が地面に奪われ、体調を崩すリスクがあります。',
      'ランタン':         '雨の日は日が沈む前から暗くなりやすいです。テント内外での作業を安全に行うために灯りが必要です。',
      '焚き火台':         '気温の低い秋キャンプでは、焚き火が暖をとる重要な手段です。安全に楽しむために焚き火台は必須です。',
      '火ばさみ':         '雨の日でも焚き火をするなら、薪や炭を安全に扱う火ばさみが必要です。濡れた薪を扱う際にも役立ちます。',
      'レインウェア':     '雨が強い予報のため、外での移動や作業時に体を雨から守るために必須です。',
      'クーラーボックス': '秋でも食材の適切な保管には必要です。雨の多い環境でも食材を清潔に保つために役立ちます。',
      '救急セット':       '雨で地面が滑りやすくなるため、転倒によるケガのリスクが上がります。急な体調不良にも備えが安心です。',
      '防水シート':       'テントの下に敷くことで、地面からの水分の染み込みを防ぎます。雨が強い日には特に効果を発揮します。',
      '厚手の上着':       '夜は5℃と低温で、雨による体感温度の低下もあります。就寝時や移動時の防寒に欠かせません。',
    },
    unnecessaryReasons: {
      '虫よけスプレー': '秋は虫の活動が少ない季節です。今回は防水・防寒対策を優先しましょう。虫よけは春夏のキャンプで特に役立ちます。',
      '水着':           '夜5℃の雨キャンプでは、水遊びをする状況ではありません。今回は防寒グッズの方がずっと重要です。',
      'サンダル':       '雨が強く気温が低い今回のキャンプでは、防水対応のしっかりした靴が必要です。サンダルでは足が濡れて体が冷えてしまいます。',
    },
  },
]

// ===== Helpers =====

function calcScore(selected, required) {
  const requiredSet = new Set(required)
  const arr = [...selected]
  const correct = arr.filter(n => requiredSet.has(n)).length
  const wrong   = arr.filter(n => !requiredSet.has(n)).length
  return Math.max(0, Math.min(100, correct * 10 - wrong * 5))
}

function calcTimeBonus(remainingTime) {
  if (remainingTime >= 45) return 20
  if (remainingTime >= 30) return 15
  if (remainingTime >= 15) return 10
  if (remainingTime >= 1)  return 5
  return 0
}

function getRank({ missed, unnecessary, baseScore, timeBonus }) {
  const finalScore = Math.min(120, baseScore + timeBonus)
  if (missed.length === 0 && unnecessary.length === 0 && timeBonus > 0) {
    return { title: 'PERFECT CAMPER', desc: '忘れ物ゼロ。状況判断もスピードも完璧です。', tier: 'perfect' }
  }
  if (finalScore >= 100) return { title: 'キャンプ達人',       desc: '素晴らしい判断力！準備はほぼ完璧。',               tier: 'gold' }
  if (finalScore >= 80)  return { title: '安心キャンパー',     desc: '準備はほぼバッチリ。自信を持って出発できます！',   tier: 'silver' }
  if (finalScore >= 60)  return { title: '準備上手になりかけ', desc: 'あと少し！次回はさらにうまくいくはず。',           tier: 'bronze' }
  return                        { title: '忘れ物注意報',        desc: '出発前にもう一度荷物を確認しよう！',               tier: 'caution' }
}

function pickRandom(arr) {
  return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null
}

function DifficultyStars({ count }) {
  return (
    <span className="stars">
      {'★'.repeat(count)}{'☆'.repeat(3 - count)}
    </span>
  )
}

// Bottom-sheet modal showing items inside one storage area
function StorageModal({ area, items, loaded, onLoad, onUnload, onClose }) {
  return (
    <div className="storage-modal-overlay" onClick={onClose}>
      <div className="storage-modal" onClick={e => e.stopPropagation()}>
        <div className="storage-modal-header" style={{ background: area.color }}>
          <span className="storage-modal-icon">{area.emoji}</span>
          <span className="storage-modal-title">{area.name}</span>
          <button className="storage-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="storage-modal-body">
          {items.map(name => {
            const isLoaded = loaded.has(name)
            return (
              <div key={name} className={`storage-item-row${isLoaded ? ' loaded' : ''}`}>
                <div className="storage-item-info">
                  <span className="storage-item-icon">{ALL_ITEMS[name] || '🏕️'}</span>
                  <span className="storage-item-name">{name}</span>
                </div>
                <button
                  className={isLoaded ? 'btn-unload' : 'btn-load'}
                  onClick={() => isLoaded ? onUnload(name) : onLoad(name)}
                >
                  {isLoaded ? '✓ 積み込み済み' : '車に積む →'}
                </button>
              </div>
            )
          })}
        </div>
        <div className="storage-modal-footer">
          <button className="storage-modal-close-btn" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  )
}

// ===== App =====

export default function App() {
  const [screen, setScreen]               = useState('start')
  const [showHowto, setShowHowto]         = useState(false)
  const [scenario, setScenario]           = useState(null)
  const [activeMission, setActiveMission] = useState(null)
  const [loaded, setLoaded]               = useState(new Set())
  const [timeLeft, setTimeLeft]           = useState(TOTAL_TIME)
  const [result, setResult]               = useState(null)
  const [openStorage, setOpenStorage]     = useState(null)
  const [charPos, setCharPos]             = useState('idle')
  const [charBubble, setCharBubble]       = useState('')
  const [charHolding, setCharHolding]     = useState(null)
  const [justAdded, setJustAdded]         = useState(new Set())

  const loadedRef        = useRef(new Set())
  const scenarioRef      = useRef(null)
  const activeMissionRef = useRef(null)
  const timeLeftRef      = useRef(TOTAL_TIME)

  const goToResult = useCallback((sel) => {
    const sc        = scenarioRef.current
    const mission   = activeMissionRef.current
    const remaining = timeLeftRef.current
    if (!sc) return

    const extraRequired     = mission?.extraRequired || []
    const effectiveRequired = [...new Set([...sc.required, ...extraRequired])]
    const baseScore         = calcScore(sel, effectiveRequired)
    const timeBonus         = calcTimeBonus(remaining)
    const finalScore        = Math.min(120, baseScore + timeBonus)
    const requiredSet       = new Set(effectiveRequired)
    const missed            = effectiveRequired.filter(n => !sel.has(n))
    const unnecessary       = [...sel].filter(n => !requiredSet.has(n))

    setResult({ baseScore, timeBonus, finalScore, remainingTime: remaining, missed, unnecessary, scenario: sc, mission })
    setScreen('result')
  }, [])

  useEffect(() => {
    if (screen !== 'game') return
    if (timeLeft <= 0) {
      goToResult(loadedRef.current)
      return
    }
    const t = setTimeout(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        timeLeftRef.current = next
        return next
      })
    }, 1000)
    return () => clearTimeout(t)
  }, [screen, timeLeft, goToResult])

  const startGame = (sc) => {
    const mission = pickRandom(MISSIONS[sc.id] || [])

    const empty = new Set()
    loadedRef.current        = empty
    scenarioRef.current      = sc
    activeMissionRef.current = mission
    timeLeftRef.current      = TOTAL_TIME

    setLoaded(empty)
    setTimeLeft(TOTAL_TIME)
    setResult(null)
    setScenario(sc)
    setActiveMission(mission)
    setOpenStorage(null)
    setCharPos('idle')
    setCharBubble('出発の準備をしよう！')
    setCharHolding(null)
    setJustAdded(new Set())
    setScreen('game')
  }

  const retryGame = () => {
    if (result?.scenario) startGame(result.scenario)
  }

  const handleLoad = (name) => {
    setLoaded(prev => {
      const next = new Set(prev)
      next.add(name)
      loadedRef.current = next
      return next
    })
    // Step 1: show "picking up" at current storage area
    setCharHolding(name)
    setCharBubble('取ったよ！')
    // Step 2: move to car after 550ms
    setTimeout(() => {
      setCharPos('car-trunk')
      setCharBubble('積み込んだ！')
      setJustAdded(prev => new Set(prev).add(name))
      setTimeout(() => {
        setJustAdded(prev => {
          const next = new Set(prev)
          next.delete(name)
          return next
        })
      }, 500)
    }, 550)
    // Clear holding
    setTimeout(() => {
      setCharHolding(null)
      setCharBubble('')
    }, 2300)
  }

  const handleUnload = (name) => {
    setLoaded(prev => {
      const next = new Set(prev)
      next.delete(name)
      loadedRef.current = next
      return next
    })
    setCharBubble(`${name}を取り出した`)
    setTimeout(() => setCharBubble(''), 1800)
  }

  // ---- Start Screen ----
  if (screen === 'start') {
    return (
      <div className="screen start-screen">
        {showHowto && (
          <div className="modal-overlay" onClick={() => setShowHowto(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">🎮 遊び方</h3>
              <ol className="howto-list">
                <li>キャンプシナリオを1つ選ぼう</li>
                <li>ガレージの収納エリアをタップして探索</li>
                <li>必要な道具を「車に積む」でトランクへ</li>
                <li>60秒以内に「出発する」ボタンを押す</li>
                <li>早く正確なほど高得点！</li>
              </ol>
              <div className="howto-note">
                <p>✅ 必要な道具を積むと<strong>加点</strong></p>
                <p>❌ 忘れると<strong>減点</strong>、不要な荷物も<strong>減点</strong></p>
                <p>⏰ 早く出発するほど<strong>タイムボーナス</strong></p>
                <p>🎯 毎回変わる<strong>追加ミッション</strong>に注意！</p>
              </div>
              <button className="btn-primary" onClick={() => setShowHowto(false)}>
                わかった！
              </button>
            </div>
          </div>
        )}

        <div className="start-content">
          <div className="start-emoji">🏕️</div>
          <h1 className="game-title">
            忘れ物ゼロ！<br />キャンプ出発まで60秒
          </h1>
          <p className="subtitle">
            ガレージを探索して道具を積み込もう。<br />60秒以内に出発できるか？
          </p>
          <button className="btn-primary" onClick={() => setScreen('select')}>
            ゲームをはじめる
          </button>
          <button className="btn-ghost" onClick={() => setShowHowto(true)}>
            ❓ 遊び方
          </button>
        </div>
      </div>
    )
  }

  // ---- Scenario Select Screen ----
  if (screen === 'select') {
    return (
      <div className="screen select-screen">
        <div className="select-header">
          <button className="btn-back" onClick={() => setScreen('start')}>
            ← タイトルへ戻る
          </button>
          <h2 className="select-title">キャンプシナリオを選ぶ</h2>
        </div>

        <div className="select-scroll">
          <div className="select-replay-hint">
            同じキャンプでも、追加ミッションが毎回変わります。<br />
            状況を見て、必要な道具を判断しよう。
          </div>

          {SCENARIOS.map(sc => (
            <div key={sc.id} className="scenario-select-card">
              <div className="sc-card-header">
                <span className="sc-card-emoji">{sc.emoji}</span>
                <div className="sc-card-meta">
                  <div className="sc-card-name">{sc.name}</div>
                  <div className="sc-card-diff">
                    難易度：<DifficultyStars count={sc.difficulty} />
                  </div>
                </div>
              </div>
              <div className="conditions">
                {sc.conditions.map(c => (
                  <span key={c.text} className="condition-tag">
                    {c.icon} {c.text}
                  </span>
                ))}
              </div>
              <button className="btn-challenge" onClick={() => startGame(sc)}>
                このキャンプに挑戦 →
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ---- Game Screen (Garage Exploration) ----
  if (screen === 'game' && scenario) {
    const urgent             = timeLeft <= 10
    const fillPct            = (timeLeft / TOTAL_TIME) * 100
    const extraRequired      = activeMission?.extraRequired || []
    const effectiveRequired  = [...new Set([...scenario.required, ...extraRequired])]
    const effectiveItemNames = [...new Set([...scenario.itemNames, ...extraRequired])]
    const loadProgress       = Math.min(100, loaded.size / Math.max(1, effectiveRequired.length) * 100)

    const itemsByStorage = {}
    STORAGE_AREAS.forEach(a => { itemsByStorage[a.id] = [] })
    effectiveItemNames.forEach(name => {
      const sid = ITEM_STORAGE[name]
      if (sid && itemsByStorage[sid]) itemsByStorage[sid].push(name)
    })

    const activeArea = STORAGE_AREAS.find(a => a.id === openStorage)

    return (
      <div className="screen game-screen">
        {/* Sticky timer bar */}
        <div className={`timer-bar${urgent ? ' urgent' : ''}`}>
          <div className="game-scenario-label">
            {scenario.emoji} {scenario.name}
          </div>
          <div className="timer-display">
            <span className="timer-label">残り</span>
            <span className="timer-num">{timeLeft}</span>
            <span className="timer-label">秒</span>
          </div>
          <div className="timer-track">
            <div className="timer-fill" style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        <div className="scroll-area garage-scroll">
          {/* Scenario conditions */}
          <div className="scenario-card">
            <div className="scenario-title">📋 キャンプ条件</div>
            <div className="conditions">
              {scenario.conditions.map(c => (
                <span key={c.text} className="condition-tag">
                  {c.icon} {c.text}
                </span>
              ))}
            </div>
          </div>

          {/* Mission card */}
          {activeMission && (
            <div className="mission-card">
              <div className="mission-card-label">🎯 追加ミッション</div>
              <div className="mission-card-text">{activeMission.text}</div>
              {activeMission.extraRequired.length > 0 && (
                <div className="mission-card-items">
                  <span>追加で必要な道具：</span>
                  {activeMission.extraRequired.map(name => (
                    <span key={name} className="mission-item-tag">
                      {ALL_ITEMS[name] || '🏕️'} {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading progress */}
          <div className="garage-progress">
            <div className="garage-progress-row">
              <span className="garage-progress-text">🎒 準備進捗</span>
              <span className="garage-progress-nums">
                <strong>{loaded.size}</strong>
                <span className="garage-progress-sep"> / {effectiveRequired.length}個</span>
              </span>
            </div>
            <div className="garage-progress-track">
              <div className="garage-progress-fill" style={{ width: `${loadProgress}%` }} />
            </div>
          </div>

          {/* ── Garage wall zone ── */}
          <div className="garage-wall-zone">
            <div className="garage-zone-label">📦 収納エリアを調べる</div>
            <div className="storage-grid">
              {STORAGE_AREAS.map(area => {
                const areaItems   = itemsByStorage[area.id] || []
                if (areaItems.length === 0) return null
                const loadedCount = areaItems.filter(n => loaded.has(n)).length
                const isOpen      = openStorage === area.id
                return (
                  <button
                    key={area.id}
                    className={`storage-card storage-card--${area.id}${isOpen ? ' active' : ''}`}
                    style={{ '--storage-color': area.color }}
                    onClick={() => {
                      setOpenStorage(area.id)
                      setCharPos(area.id)
                      setCharBubble(`${area.name}を調べている…`)
                      setTimeout(() => setCharBubble(''), 2200)
                    }}
                  >
                    <span className="storage-card-emoji">{area.emoji}</span>
                    <span className="storage-card-name">{area.name}</span>
                    <div className="storage-card-counts">
                      {loadedCount > 0 && (
                        <span className="storage-loaded-badge">✓ {loadedCount}個</span>
                      )}
                      <span className="storage-total-badge">{areaItems.length}点</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Camper character */}
            <div className="character-strip">
              <div
                className="char-figure-wrap"
                style={{ left: CHAR_X[charPos] || '46%' }}
              >
                {charBubble && <div className="char-bubble">{charBubble}</div>}
                <div className="char-body">
                  <div className="char-figure">🧑‍🦱</div>
                  {charHolding && (
                    <div className="char-holding">{ALL_ITEMS[charHolding] || '📦'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Car zone ── */}
          <div className="garage-car-zone">
            <div className="car-body-strip">
              <span className="car-strip-title">🚗 車の荷室</span>
              <span className="car-strip-hint">タップで取り出し</span>
            </div>
            <div className="car-trunk-interior">
              {loaded.size === 0 ? (
                <p className="trunk-empty-hint">まだ何も積んでいません。棚を調べて積み込もう！</p>
              ) : (
                <div className="trunk-items-grid">
                  {[...loaded].map(name => (
                    <button
                      key={name}
                      className={`trunk-item-tag${justAdded.has(name) ? ' just-added' : ''}`}
                      onClick={() => {
                        setCharPos('car-trunk')
                        handleUnload(name)
                      }}
                    >
                      {ALL_ITEMS[name] || '🏕️'} {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed departure bar */}
        <div className="depart-bar">
          <span className="selected-count">{loaded.size}個積み込み済み</span>
          <button
            className="btn-depart"
            onClick={() => {
              setCharPos('car-trunk')
              setScreen('trunk-confirm')
            }}
          >
            🚗 出発する！
          </button>
        </div>

        {/* Storage modal (bottom sheet) */}
        {openStorage && activeArea && (
          <StorageModal
            area={activeArea}
            items={itemsByStorage[openStorage] || []}
            loaded={loaded}
            onLoad={handleLoad}
            onUnload={(name) => {
              setCharPos(openStorage)
              handleUnload(name)
            }}
            onClose={() => setOpenStorage(null)}
          />
        )}
      </div>
    )
  }

  // ---- Trunk Confirm Screen ----
  if (screen === 'trunk-confirm' && scenario) {
    return (
      <div className="screen trunk-confirm-screen">
        <div className="trunk-confirm-header">
          <h2 className="trunk-confirm-title">🚗 荷室の最終確認</h2>
          <p className="trunk-confirm-subtitle">{scenario.emoji} {scenario.name}</p>
        </div>

        <div className="trunk-confirm-scroll">
          <div className="trunk-confirm-count">
            {loaded.size}個の道具を積み込みました
          </div>

          <div className="trunk-confirm-list">
            {loaded.size === 0 ? (
              <p className="trunk-confirm-empty">
                荷物が何もありません。ガレージへ戻って積み込もう！
              </p>
            ) : (
              [...loaded].map(name => (
                <div key={name} className="trunk-confirm-item">
                  <span className="trunk-confirm-item-icon">{ALL_ITEMS[name] || '🏕️'}</span>
                  <span className="trunk-confirm-item-name">{name}</span>
                </div>
              ))
            )}
          </div>

          <div className="trunk-confirm-buttons">
            <button
              className="btn-primary"
              onClick={() => goToResult(loadedRef.current)}
            >
              この内容で出発する
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setCharPos('car-trunk')
                setCharBubble('戻ってきた！')
                setTimeout(() => setCharBubble(''), 2000)
                setScreen('game')
              }}
            >
              ガレージへ戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Result Screen ----
  if (screen === 'result' && result) {
    const { baseScore, timeBonus, finalScore, remainingTime, missed, unnecessary, scenario: sc, mission } = result
    const rank = getRank(result)

    const missionItemSet  = new Set(mission?.extraRequired || [])
    const baseRequiredSet = new Set(sc.required)

    function getMissedReason(name) {
      const isMission = missionItemSet.has(name)
      const isBase    = baseRequiredSet.has(name)

      if (isMission && !isBase) {
        return mission?.extraReasons?.[name] || `追加ミッション「${mission?.text}」への対応として必要でした。`
      }
      if (isMission && isBase) {
        const base = sc.requiredReasons[name] || ''
        const note = mission?.extraReasons?.[name] || `追加ミッション「${mission?.text}」への対応としても特に重要でした。`
        return base ? `${base} ${note}` : note
      }
      return sc.requiredReasons[name] || ''
    }

    return (
      <div className="screen result-screen">
        <div className="scroll-area result-scroll">
          <h2 className="result-heading">🏆 結果発表</h2>
          <div className="result-scenario-label">{sc.emoji} {sc.name}</div>

          {/* Rank card */}
          <div className={`rank-card rank-${rank.tier}`}>
            <div className="rank-title">{rank.title}</div>
            <p className="rank-desc">{rank.desc}</p>
          </div>

          {/* Score breakdown */}
          <div className="score-card">
            <div className="score-card-label">最終スコア</div>
            <div className="score-row">
              <span className="score-num">{finalScore}</span>
              <span className="score-unit">点</span>
            </div>
            <div className="score-detail-row">
              <span>基本スコア <strong>{baseScore}点</strong></span>
              <span className="score-plus">＋</span>
              <span>
                タイムボーナス <strong>+{timeBonus}点</strong>
                {timeBonus > 0
                  ? <span className="score-time-note">（残り{remainingTime}秒）</span>
                  : <span className="score-time-note">（時間切れ）</span>
                }
              </span>
            </div>
          </div>

          {/* Mission recap */}
          {mission && (
            <div className="mission-recap-card">
              <div className="mission-recap-label">🎯 今回の追加ミッション</div>
              <div className="mission-recap-text">{mission.text}</div>
              {mission.extraRequired.length > 0 && (
                <div className="mission-recap-items">
                  <span className="mission-recap-hint">追加で必要な道具：</span>
                  {mission.extraRequired.map(name => (
                    <span key={name} className="mission-item-tag">
                      {ALL_ITEMS[name] || '🏕️'} {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Missed items */}
          {missed.length > 0 && (
            <div className="review-card missed">
              <div className="review-title">😱 忘れ物（{missed.length}個）</div>
              <div className="review-list">
                {missed.map(name => (
                  <div key={name} className="review-item">
                    <div className="review-item-name">
                      {ALL_ITEMS[name] || '🏕️'} {name}
                      {missionItemSet.has(name) && (
                        <span className="mission-badge-small">🎯 ミッション</span>
                      )}
                    </div>
                    <p className="review-item-reason">{getMissedReason(name)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low-priority items */}
          {unnecessary.length > 0 && (
            <div className="review-card unnecessary">
              <div className="review-title">
                🎒 今回の条件では優先度が低い荷物（{unnecessary.length}個）
              </div>
              <div className="review-list">
                {unnecessary.map(name => (
                  <div key={name} className="review-item">
                    <div className="review-item-name">
                      {ALL_ITEMS[name] || '🏕️'} {name}
                    </div>
                    <p className="review-item-reason">
                      {sc.unnecessaryReasons[name] ?? 'このシナリオでは優先度が低い荷物です。'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="camp-point-card">
            <div className="camp-point-title">🌿 今回のキャンプポイント</div>
            <p className="camp-point-text">{sc.campPoint}</p>
          </div>

          <div className="result-buttons">
            <button className="btn-primary" onClick={retryGame}>
              もう一度遊ぶ
            </button>
            <button className="btn-secondary" onClick={() => setScreen('select')}>
              別のシナリオに挑戦
            </button>
            <button className="btn-ghost-dark" onClick={() => setScreen('start')}>
              タイトルへ戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
