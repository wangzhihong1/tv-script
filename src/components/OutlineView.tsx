import { useEffect, useMemo, useState } from 'react'
import type { Episode, EpisodeMarker, HookType, Project } from '../types'
import { HOOK_LABELS, MARKER_LABELS } from '../types'
import { craftSnapshot } from '../checks'
import {
  createEpisode,
  episodeHasScript,
  episodeOutlineFilled,
  episodePhase,
  fillEpisodes,
  PHASE_LABELS,
  renumberEpisodes,
} from '../model'
import { AutoTextarea, EmptyHint, Field, padEp } from './ui'

type Filter = 'all' | 'empty' | 'nohook' | 'untyped' | 'key' | 'paywall' | 'ready'

export function OutlineView({
  project,
  onChange,
}: {
  project: Project
  onChange: (project: Project) => void
}) {
  const [selectedId, setSelectedId] = useState(project.episodes[0]?.id ?? '')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    setSelectedId(project.episodes[0]?.id ?? '')
    setFilter('all')
  }, [project.id])
  const selected =
    project.episodes.find((episode) => episode.id === selectedId) ?? project.episodes[0] ?? null
  const craft = useMemo(() => craftSnapshot(project), [project])
  const phase = selected
    ? PHASE_LABELS[episodePhase(selected.number, project.targetEpisodes)]
    : ''

  const visible = useMemo(() => {
    return project.episodes.filter((episode) => {
      if (filter === 'empty') return episodeOutlineFilled(episode) === 0
      if (filter === 'nohook') return !episode.endingHook.trim()
      if (filter === 'untyped') return Boolean(episode.endingHook.trim()) && !episode.hookType
      if (filter === 'key') return episode.marker === 'key'
      if (filter === 'paywall') return episode.marker === 'paywall'
      if (filter === 'ready') return episodeOutlineFilled(episode) === 3
      return true
    })
  }, [filter, project.episodes])

  function patchEpisode(id: string, patch: Partial<Episode>) {
    onChange({
      ...project,
      episodes: project.episodes.map((episode) =>
        episode.id === id ? { ...episode, ...patch } : episode,
      ),
    })
  }

  function addAfter(number: number) {
    const next = [...project.episodes]
    next.splice(number, 0, createEpisode(number + 1))
    onChange({ ...project, episodes: renumberEpisodes(next) })
  }

  function remove(id: string) {
    if (!confirm('删除这一集？大纲和剧本都会一起删掉。')) return
    const next = renumberEpisodes(project.episodes.filter((episode) => episode.id !== id))
    onChange({ ...project, episodes: next })
    setSelectedId(next[0]?.id ?? '')
  }

  return (
    <div className="page split">
      <div className="split-main">
        <header className="page-head">
          <div>
            <p className="eyebrow">故事大纲</p>
            <h1>每集三拍，集尾必须有钩子</h1>
          </div>
          <div className="head-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                onChange({
                  ...project,
                  episodes: fillEpisodes(project.episodes, project.targetEpisodes),
                })
              }
            >
              补齐到 {project.targetEpisodes} 集
            </button>
            <button
              type="button"
              className="btn gold"
              onClick={() => {
                const episode = createEpisode(project.episodes.length + 1)
                onChange({ ...project, episodes: [...project.episodes, episode] })
                setSelectedId(episode.id)
              }}
            >
              新增一集
            </button>
          </div>
        </header>

        <div className="filter-row">
          {(
            [
              ['all', '全部'],
              ['empty', '空集'],
              ['nohook', '缺钩子'],
              ['untyped', '未标类型'],
              ['key', '重点'],
              ['paywall', '付费'],
              ['ready', '已写完'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? 'chip on' : 'chip'}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
          <span className="quiet">
            {project.episodes.length} / {project.targetEpisodes} 集 · 重点 {craft.keyCount} · 卡点{' '}
            {craft.paywallCount}
          </span>
        </div>

        {project.episodes.length === 0 ? (
          <EmptyHint
            title="还没有分集"
            text="按目标集数一次性铺开空格子，然后从第 1 集写开场、中段、钩子，并标上钩子类型。"
          />
        ) : (
          <div className="episode-grid">
            {visible.map((episode) => {
              const filled = episodeOutlineFilled(episode)
              return (
                <button
                  key={episode.id}
                  type="button"
                  className={
                    episode.id === selected?.id
                      ? `ep-card on marker-${episode.marker}`
                      : `ep-card marker-${episode.marker}`
                  }
                  onClick={() => setSelectedId(episode.id)}
                >
                  <div className="ep-card-top">
                    <span>EP {padEp(episode.number)}</span>
                    <span className={`dots n${filled}`}>
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                  <strong>{episode.title || '未命名'}</strong>
                  <p>{episode.endingHook || episode.opening || '还没写钩子'}</p>
                  <div className="ep-tags">
                    {episode.hookType ? <em>{HOOK_LABELS[episode.hookType]}</em> : null}
                    {episode.marker === 'key' ? <em className="tag-key">重点</em> : null}
                    {episode.marker === 'paywall' ? <em className="tag-pay">付费</em> : null}
                    {episodeHasScript(episode) ? <em>已有剧本</em> : null}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <aside className="split-side">
        {selected ? (
          <div className="panel sticky-panel">
            <div className="side-kicker">
              第 {padEp(selected.number)} 集 · {phase}段
            </div>
            <Field label="集标题">
              <input
                value={selected.title}
                placeholder="婚礼上的私生子"
                onChange={(event) => patchEpisode(selected.id, { title: event.target.value })}
              />
            </Field>
            <div className="grid-2">
              <Field label="钩子类型">
                <select
                  value={selected.hookType}
                  onChange={(event) =>
                    patchEpisode(selected.id, { hookType: event.target.value as HookType | '' })
                  }
                >
                  <option value="">未标注</option>
                  {Object.entries(HOOK_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="集标记">
                <select
                  value={selected.marker}
                  onChange={(event) =>
                    patchEpisode(selected.id, { marker: event.target.value as EpisodeMarker })
                  }
                >
                  {Object.entries(MARKER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="集标题钩子" hint="预告这句话">
              <input
                value={selected.hookTitle}
                placeholder="警报响了，他先把戒指扔了"
                onChange={(event) => patchEpisode(selected.id, { hookTitle: event.target.value })}
              />
            </Field>
            <Field label="开场冲突">
              <AutoTextarea
                rows={3}
                placeholder="顾氏庄园订婚宴上，天空裂开，陨石预警全城拉响。"
                value={selected.opening}
                onChange={(event) => patchEpisode(selected.id, { opening: event.target.value })}
              />
            </Field>
            <Field label="中段推进">
              <AutoTextarea
                rows={3}
                placeholder="顾寒当众悔婚：末日来了，方舟没有你的位置。宋织当场亮出金船票。"
                value={selected.middle}
                onChange={(event) => patchEpisode(selected.id, { middle: event.target.value })}
              />
            </Field>
            <Field label="结尾钩子">
              <AutoTextarea
                rows={3}
                placeholder="黎霜被赶出大门，手腕旧伤疤忽然发光，脚下防空洞的门自己开了。"
                value={selected.endingHook}
                onChange={(event) => patchEpisode(selected.id, { endingHook: event.target.value })}
              />
            </Field>
            <Field label="下集预告">
              <input
                value={selected.nextPreview}
                placeholder="门后不是防空洞。"
                onChange={(event) =>
                  patchEpisode(selected.id, { nextPreview: event.target.value })
                }
              />
            </Field>
            <Field label="本集备注">
              <AutoTextarea
                rows={2}
                value={selected.notes}
                onChange={(event) => patchEpisode(selected.id, { notes: event.target.value })}
              />
            </Field>
            <div className="row-actions">
              <button type="button" className="btn ghost" onClick={() => addAfter(selected.number)}>
                在后面插入
              </button>
              <button type="button" className="btn danger-text" onClick={() => remove(selected.id)}>
                删除此集
              </button>
            </div>
          </div>
        ) : (
          <EmptyHint title="选择一集" text="点左侧卡片，开始写三拍大纲。" />
        )}
      </aside>
    </div>
  )
}
