import { useEffect, useMemo, useState } from 'react'
import type { Episode, Project } from '../types'
import {
  createEpisode,
  episodeHasScript,
  episodeOutlineFilled,
  fillEpisodes,
  renumberEpisodes,
} from '../model'
import { AutoTextarea, EmptyHint, Field, padEp } from './ui'

type Filter = 'all' | 'empty' | 'nohook' | 'ready'

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

  const visible = useMemo(() => {
    return project.episodes.filter((episode) => {
      if (filter === 'empty') return episodeOutlineFilled(episode) === 0
      if (filter === 'nohook') return !episode.endingHook.trim()
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
            <p className="eyebrow">分集大纲</p>
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
            {project.episodes.length} / {project.targetEpisodes} 集
          </span>
        </div>

        {project.episodes.length === 0 ? (
          <EmptyHint
            title="还没有分集"
            text="按目标集数一次性铺开空格子，然后从第 1 集写开场、中段、钩子。"
          />
        ) : (
          <div className="episode-grid">
            {visible.map((episode) => {
              const filled = episodeOutlineFilled(episode)
              return (
                <button
                  key={episode.id}
                  type="button"
                  className={episode.id === selected?.id ? 'ep-card on' : 'ep-card'}
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
                  {episodeHasScript(episode) ? <em>已有剧本</em> : null}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <aside className="split-side">
        {selected ? (
          <div className="panel sticky-panel">
            <div className="side-kicker">第 {padEp(selected.number)} 集</div>
            <Field label="集标题">
              <input
                value={selected.title}
                placeholder="婚礼上的私生子"
                onChange={(event) => patchEpisode(selected.id, { title: event.target.value })}
              />
            </Field>
            <Field label="集标题钩子" hint="预告这句话">
              <input
                value={selected.hookTitle}
                placeholder="戒指扔进香槟塔的那一秒"
                onChange={(event) => patchEpisode(selected.id, { hookTitle: event.target.value })}
              />
            </Field>
            <Field label="开场冲突">
              <AutoTextarea
                rows={3}
                placeholder="顾琛在教堂当众悔婚，说孩子不是他的。"
                value={selected.opening}
                onChange={(event) => patchEpisode(selected.id, { opening: event.target.value })}
              />
            </Field>
            <Field label="中段推进">
              <AutoTextarea
                rows={3}
                placeholder="苏曼拿出被调包的鉴定，林晚被赶出红毯。"
                value={selected.middle}
                onChange={(event) => patchEpisode(selected.id, { middle: event.target.value })}
              />
            </Field>
            <Field label="结尾钩子">
              <AutoTextarea
                rows={3}
                placeholder="鉴定最后一页，匹配的人是顾父。"
                value={selected.endingHook}
                onChange={(event) => patchEpisode(selected.id, { endingHook: event.target.value })}
              />
            </Field>
            <Field label="下集预告">
              <input
                value={selected.nextPreview}
                placeholder="顾家老爷子出现在侧廊。"
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
