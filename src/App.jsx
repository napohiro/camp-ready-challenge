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
}

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

function calcScore(selected, required) {
  const requiredSet = new Set(required)
  const arr = [...selected]
  const correct = arr.filter(n => requiredSet.has(n)).length
  const wrong = arr.filter(n => !requiredSet.has(n)).length
  return Math.max(0, Math.min(100, correct * 10 - wrong * 5))
}

function getJudge(score) {
  if (score >= 90) return { rank: 'キャンプ達人',   comment: '完璧な準備！最高のキャンプになるよ！🎉' }
  if (score >= 70) return { rank: '安心キャンパー', comment: '上出来！準備はほぼバッチリ！👍' }
  if (score >= 50) return { rank: 'あと少し',       comment: 'もう少し確認しよう。忘れ物に注意！⚠️' }
  return              { rank: '忘れ物注意報',      comment: '出発前に荷物をしっかり見直して！😱' }
}

function DifficultyStars({ count }) {
  return (
    <span className="stars">
      {'★'.repeat(count)}{'☆'.repeat(3 - count)}
    </span>
  )
}

export default function App() {
  const [screen, setScreen]       = useState('start')
  const [showHowto, setShowHowto] = useState(false)
  const [scenario, setScenario]   = useState(null)
  const [selected, setSelected]   = useState(new Set())
  const [timeLeft, setTimeLeft]   = useState(TOTAL_TIME)
  const [result, setResult]       = useState(null)

  const selectedRef = useRef(new Set())
  const scenarioRef = useRef(null)

  const goToResult = useCallback((sel) => {
    const sc = scenarioRef.current
    if (!sc) return
    const requiredSet = new Set(sc.required)
    const score = calcScore(sel, sc.required)
    const missed = sc.required.filter(n => !sel.has(n))
    const unnecessary = [...sel].filter(n => !requiredSet.has(n))
    setResult({ score, missed, unnecessary, scenario: sc })
    setScreen('result')
  }, [])

  useEffect(() => {
    if (screen !== 'game') return
    if (timeLeft <= 0) {
      goToResult(selectedRef.current)
      return
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [screen, timeLeft, goToResult])

  const startGame = (sc) => {
    const empty = new Set()
    selectedRef.current = empty
    scenarioRef.current = sc
    setSelected(empty)
    setTimeLeft(TOTAL_TIME)
    setResult(null)
    setScenario(sc)
    setScreen('game')
  }

  const retryGame = () => {
    if (result?.scenario) startGame(result.scenario)
  }

  const toggleItem = (name) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      selectedRef.current = next
      return next
    })
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
                <li>シナリオの条件をよく確認する</li>
                <li>必要だと思う道具をタップして選択</li>
                <li>60秒以内に「出発する」ボタンを押す</li>
                <li>正解数に応じてスコアが決まる！</li>
              </ol>
              <div className="howto-note">
                <p>✅ 必要な道具を選ぶと<strong>加点</strong></p>
                <p>❌ 忘れると<strong>減点</strong>、不要な荷物も<strong>減点</strong></p>
                <p>⏰ 時間切れでも自動で採点されます</p>
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
            キャンプ出発前、<br />必要な道具を60秒以内に選ぼう
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

  // ---- Game Screen ----
  if (screen === 'game' && scenario) {
    const urgent  = timeLeft <= 10
    const fillPct = (timeLeft / TOTAL_TIME) * 100
    const items   = scenario.itemNames.map(name => ({ name, emoji: ALL_ITEMS[name] }))

    return (
      <div className="screen game-screen">
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

        <div className="scroll-area">
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

          <div className="items-section">
            <p className="items-hint">必要な道具をタップして選ぼう</p>
            <div className="items-grid">
              {items.map(item => {
                const isSelected = selected.has(item.name)
                return (
                  <button
                    key={item.name}
                    className={`item-card${isSelected ? ' selected' : ''}`}
                    onClick={() => toggleItem(item.name)}
                  >
                    {isSelected && <span className="check-mark">✓</span>}
                    <span className="item-emoji">{item.emoji}</span>
                    <span className="item-name">{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="depart-bar">
          <span className="selected-count">{selected.size}個選択中</span>
          <button className="btn-depart" onClick={() => goToResult(selectedRef.current)}>
            🚗 出発する！
          </button>
        </div>
      </div>
    )
  }

  // ---- Result Screen ----
  if (screen === 'result' && result) {
    const { score, missed, unnecessary, scenario: sc } = result
    const { rank, comment } = getJudge(score)

    return (
      <div className="screen result-screen">
        <div className="scroll-area result-scroll">
          <h2 className="result-heading">🏆 結果発表</h2>
          <div className="result-scenario-label">{sc.emoji} {sc.name}</div>

          <div className="score-card">
            <div className="score-row">
              <span className="score-num">{score}</span>
              <span className="score-unit">点</span>
            </div>
            <div className="score-rank">{rank}</div>
            <p className="score-comment">{comment}</p>
          </div>

          {missed.length > 0 && (
            <div className="review-card missed">
              <div className="review-title">😱 忘れ物（{missed.length}個）</div>
              <div className="review-list">
                {missed.map(name => (
                  <div key={name} className="review-item">
                    <div className="review-item-name">
                      {ALL_ITEMS[name]} {name}
                    </div>
                    <p className="review-item-reason">
                      {sc.requiredReasons[name]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unnecessary.length > 0 && (
            <div className="review-card unnecessary">
              <div className="review-title">
                🎒 今回の条件では優先度が低い荷物（{unnecessary.length}個）
              </div>
              <div className="review-list">
                {unnecessary.map(name => (
                  <div key={name} className="review-item">
                    <div className="review-item-name">
                      {ALL_ITEMS[name]} {name}
                    </div>
                    <p className="review-item-reason">
                      {sc.unnecessaryReasons[name] ?? 'このシナリオでは優先度が低い荷物です。'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {missed.length === 0 && unnecessary.length === 0 && (
            <div className="perfect-msg">🎉 完璧！全問正解！</div>
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
