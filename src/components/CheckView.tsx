import type { Project, View } from '../types'
import { analyzeProject, checkScore } from '../checks'

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
  const rank = score >= 80 ? '可以往下写了' : score >= 50 ? '骨架有了，钩子还不够狠' : '还不能拍，先补必选项'

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">钩子检查</p>
          <h1>先检查能不能留住观众</h1>
        </div>
        <div className="score-orb">
          <strong>{score}</strong>
          <span>分</span>
        </div>
      </header>

      <p className="lead">
        {rank}。必选项未通过 {mustFail} 项。短剧不是写完 80 集才检查，是每一集结尾都要能卖下一集。
      </p>

      <ul className="check-list">
        {items.map((item) => (
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
    </div>
  )
}
