import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const TOTAL_TIME = 60

const SCENARIO = {
  name: '春のファミリーキャンプ',
  conditions: [
    { icon: '🌸', text: '1泊2日' },
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
  items: [
    { name: 'テント',           emoji: '⛺' },
    { name: 'タープ',           emoji: '🏕️' },
    { name: '寝袋',             emoji: '🛌' },
    { name: 'マット',           emoji: '🟫' },
    { name: 'ランタン',         emoji: '🏮' },
    { name: '焚き火台',         emoji: '🔥' },
    { name: '火ばさみ',         emoji: '🔧' },
    { name: 'レインウェア',     emoji: '🧥' },
    { name: 'クーラーボックス', emoji: '🧊' },
    { name: '救急セット',       emoji: '🩺' },
    { name: 'シュノーケル',     emoji: '🤿' },
    { name: '扇風機',           emoji: '🌀' },
    { name: 'スノーボード',     emoji: '🏂' },
    { name: '釣り竿',           emoji: '🎣' },
    { name: 'ハンモック',       emoji: '🏖️' },
  ],
}

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

export default function App() {
  const [screen, setScreen] = useState('start')
  const [selected, setSelected] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [result, setResult] = useState(null)

  // Ref keeps latest selected value accessible inside the timer effect
  const selectedRef = useRef(new Set())

  const goToResult = useCallback((sel) => {
    const requiredSet = new Set(SCENARIO.required)
    const score = calcScore(sel, SCENARIO.required)
    const missed = SCENARIO.required.filter(n => !sel.has(n))
    const unnecessary = [...sel].filter(n => !requiredSet.has(n))
    setResult({ score, missed, unnecessary })
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

  const startGame = () => {
    const empty = new Set()
    selectedRef.current = empty
    setSelected(empty)
    setTimeLeft(TOTAL_TIME)
    setResult(null)
    setScreen('game')
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
        <div className="start-content">
          <div className="start-emoji">🏕️</div>
          <h1 className="game-title">
            忘れ物ゼロ！<br />キャンプ出発まで60秒
          </h1>
          <p className="subtitle">
            キャンプ出発前、<br />必要な道具を60秒以内に選ぼう
          </p>
          <button className="btn-primary" onClick={startGame}>
            ゲームをはじめる
          </button>
        </div>
      </div>
    )
  }

  // ---- Game Screen ----
  if (screen === 'game') {
    const urgent = timeLeft <= 10
    const fillPct = (timeLeft / TOTAL_TIME) * 100

    return (
      <div className="screen game-screen">
        <div className={`timer-bar${urgent ? ' urgent' : ''}`}>
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
            <div className="scenario-title">📋 {SCENARIO.name}</div>
            <div className="conditions">
              {SCENARIO.conditions.map(c => (
                <span key={c.text} className="condition-tag">
                  {c.icon} {c.text}
                </span>
              ))}
            </div>
          </div>

          <div className="items-section">
            <p className="items-hint">必要な道具をタップして選ぼう</p>
            <div className="items-grid">
              {SCENARIO.items.map(item => {
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
    const { score, missed, unnecessary } = result
    const { rank, comment } = getJudge(score)

    return (
      <div className="screen result-screen">
        <div className="scroll-area result-scroll">
          <h2 className="result-heading">🏆 結果発表</h2>

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
                {missed.map(name => {
                  const item = SCENARIO.items.find(i => i.name === name)
                  return (
                    <span key={name} className="review-tag missed-tag">
                      {item?.emoji} {name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {unnecessary.length > 0 && (
            <div className="review-card unnecessary">
              <div className="review-title">🎒 不要な荷物（{unnecessary.length}個）</div>
              <div className="review-items">
                {unnecessary.map(name => {
                  const item = SCENARIO.items.find(i => i.name === name)
                  return (
                    <span key={name} className="review-tag unnecessary-tag">
                      {item?.emoji} {name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {missed.length === 0 && unnecessary.length === 0 && (
            <div className="perfect-msg">🎉 完璧！全問正解！</div>
          )}

          <div className="result-buttons">
            <button className="btn-primary" onClick={startGame}>
              もう一度遊ぶ
            </button>
            <button className="btn-secondary" onClick={() => setScreen('start')}>
              タイトルへ戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
