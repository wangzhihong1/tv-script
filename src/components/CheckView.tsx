import type { Project, View } from '../types'
import { analyzeProject, checkScore } from '../checks'

const GROUP_COPY = {
  structure: {
    eyebrow: '骨架',
    title: '先看有没有写够',
  },
  craft: {
    eyebrow: '工艺',
    title: '再看写得对不对',
  },
} as const

export function CheckView({
  project,
  onGoto,
}: {
  project: Project
  onGoto: (view: View) => void
}) {
  const items = analyzeProject(project)
  const score = checkScore(items)
  const mustFail = items.filter((item) => item.level === 'must' && !item.pass).length
  const craftFail = items.filter((item) => item.group === 'craft' && !item.pass).length
  const rank =
    mustFail > 0
      ? '还不能拍，先补必选项'
      : score >= 80
        ? '骨架和工艺都站得住了'
        : score >= 50
          ? '骨架有了，钩子类型和卡点还不够狠'
          : '还不能拍，先补必选项'

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">质量检查</p>
          <h1>先检查能不能留住观众</h1>
        </div>
        <div className="score-orb">
          <strong>{score}</strong>
          <span>分</span>
        </div>
      </header>

      <p className="lead">
        {rank}。必选项未通过 {mustFail} 项，工艺未通过 {craftFail} 项。短剧不是写完 80 集才检查，是每一集结尾都要能卖下一集。
      </p>

      {(['structure', 'craft'] as const).map((group) => {
        const grouped = items.filter((item) => item.group === group)
        return (
          <section key={group} className="check-group">
            <header className="check-group-head">
              <p className="eyebrow">{GROUP_COPY[group].eyebrow}</p>
              <h2>{GROUP_COPY[group].title}</h2>
            </header>
            <ul className="check-list">
              {grouped.map((item) => (
                <li key={item.id} className={item.pass ? 'pass' : 'fail'}>
                  <div>
                    <b>{item.pass ? '通过' : item.level === 'must' ? '必补' : '建议'}</b>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                  {item.goto && !item.pass ? (
                    <button type="button" className="btn ghost" onClick={() => onGoto(item.goto!)}>
                      去补
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
