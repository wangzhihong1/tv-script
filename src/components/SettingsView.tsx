import { AUDIENCE_LABELS, GENRES } from '../types'
import type { Audience, Project } from '../types'
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
          <h1>先把卖点立住</h1>
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
        </div>
        <Field label="一句话卖点" hint="观众三秒内能听懂的钩子">
          <AutoTextarea
            rows={4}
            placeholder="被全家抛弃的灰姑娘，其实是消失十年的财阀千金。"
            value={project.logline}
            onChange={(event) => onChange({ ...project, logline: event.target.value })}
          />
        </Field>
      </section>

      <section className="tips">
        <h2>这一页只做三件事</h2>
        <ol>
          <li>用一句话写清身份反差，不要写世界观说明书。</li>
          <li>定下集数，后面大纲板才能按目标铺格子。</li>
          <li>类型和受众会决定钩子长什么样：女频要打脸和身份，男频要反杀和规则。</li>
        </ol>
      </section>
    </div>
  )
}
