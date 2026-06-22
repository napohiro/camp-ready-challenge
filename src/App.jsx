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

  // Refs for latest values inside timer effect (avoids stale closures)
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
              <div className="review-items">
                {missed.map(name => (
                  <span key={name} className="review-tag missed-tag">
                    {ALL_ITEMS[name]} {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {unnecessary.length > 0 && (
            <div className="review-card unnecessary">
              <div className="review-title">🎒 不要な荷物（{unnecessary.length}個）</div>
              <div className="review-items">
                {unnecessary.map(name => (
                  <span key={name} className="review-tag unnecessary-tag">
                    {ALL_ITEMS[name]} {name}
                  </span>
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
