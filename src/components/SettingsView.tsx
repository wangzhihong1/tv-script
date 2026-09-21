import { AUDIENCE_LABELS, ENDING_LABELS, GENRES, TONE_LABELS } from '../types'
import type { Audience, EndingType, Project, Tone } from '../types'
import { projectCompletion } from '../model'
import { AutoTextarea, Field } from './ui'

export function SettingsView({
  project,
  onChange,
}: {
  project: Project
  onChange: (project: Project) => void
}) {
  const completion = projectCompletion(project)
  const stats = [
    ['人物', `${project.characters.length} 人`],
    ['大纲', `${project.episodes.length} / ${project.targetEpisodes} 集`],
    ['完成度', `${completion}%`],
  ]

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">剧目设定</p>
          <h1>类型、受众、集数</h1>
        </div>
      </header>

      <div className="stat-row">
        {stats.map(([label, value]) => (
          <div key={label} className="stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="grid-2">
          <Field label="剧名">
            <input
              value={project.title}
              onChange={(event) => onChange({ ...project, title: event.target.value })}
            />
          </Field>
          <Field label="目标集数">
            <input
              type="number"
              min={1}
              max={200}
              value={project.targetEpisodes}
              onChange={(event) =>
                onChange({
                  ...project,
                  targetEpisodes: Math.max(1, Number(event.target.value) || 1),
                })
              }
            />
          </Field>
          <Field label="类型">
            <select
              value={project.genre}
              onChange={(event) => onChange({ ...project, genre: event.target.value })}
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="受众">
            <select
              value={project.audience}
              onChange={(event) =>
                onChange({ ...project, audience: event.target.value as Audience })
              }
            >
              {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="调性">
            <select
              value={project.tone}
              onChange={(event) => onChange({ ...project, tone: event.target.value as Tone })}
            >
              {Object.entries(TONE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="结局">
            <select
              value={project.endingType}
              onChange={(event) =>
                onChange({ ...project, endingType: event.target.value as EndingType })
              }
            >
              {Object.entries(ENDING_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="一句话卖点" hint="观众三秒内能听懂的钩子">
          <AutoTextarea
            rows={4}
            placeholder="末日倒计时开始那天，被悔婚的女人发现：全人类的方舟，只认她的血。"
            value={project.logline}
            onChange={(event) => onChange({ ...project, logline: event.target.value })}
          />
        </Field>
      </section>

      <section className="tips">
        <h2>这一页只管规格</h2>
        <ol>
          <li>完整故事写在「故事」页，这里只锁类型、受众、调性和集数。</li>
          <li>定下集数，后面大纲才能按目标铺格子。</li>
          <li>结局先锁定，后面才不会写到第 60 集还在改命运。</li>
        </ol>
      </section>
    </div>
  )
}
