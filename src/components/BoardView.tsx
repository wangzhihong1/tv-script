import { useEffect, useState } from 'react'
import type { Episode, H3Clip, Project } from '../types'
import { episodeHasClips, episodeHasScript } from '../model'
import { buildEpisodeClips } from '../storyboard'
import { AutoTextarea, EmptyHint, Field, padEp } from './ui'

export function BoardView({
  project,
  onChange,
  online,
}: {
  project: Project
  onChange: (project: Project) => void
  online: boolean
}) {
  const [selectedId, setSelectedId] = useState(project.episodes[0]?.id ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    setSelectedId(project.episodes[0]?.id ?? '')
    setError('')
  }, [project.id])

  const selected =
    project.episodes.find((episode) => episode.id === selectedId) ?? project.episodes[0] ?? null

  function patchEpisode(id: string, patch: Partial<Episode>) {
    onChange({
      ...project,
      episodes: project.episodes.map((episode) =>
        episode.id === id ? { ...episode, ...patch } : episode,
      ),
    })
  }

  function patchClip(episodeId: string, clipId: string, patch: Partial<H3Clip>) {
    const episode = project.episodes.find((item) => item.id === episodeId)
    if (!episode) return
    patchEpisode(episodeId, {
      clips: episode.clips.map((clip) => (clip.id === clipId ? { ...clip, ...patch } : clip)),
    })
  }

  function generate() {
    if (!selected) return
    if (!episodeHasScript(selected)) {
      setError('这一集还没有剧本。先写场次和对白。')
      return
    }
    if (
      episodeHasClips(selected) &&
      !confirm('本集已有提示词，重新生成会覆盖当前编辑。继续？')
    ) {
      return
    }
    setBusy(true)
    setError('')
    try {
      patchEpisode(selected.id, { clips: buildEpisodeClips(project, selected.id) })
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setBusy(false)
    }
  }

  async function copyPrompt(clip: H3Clip) {
    await navigator.clipboard.writeText(clip.prompt)
    setCopied(clip.id)
    window.setTimeout(() => setCopied(''), 1200)
  }

  return (
    <div className="page split">
      <aside className="script-nav">
        <p className="eyebrow">选一集拆</p>
        <h2>分镜</h2>
        {project.episodes.length === 0 ? (
          <EmptyHint title="先去大纲建集" text="没有分集就没法拆 H3 镜头。" />
        ) : (
          <ul className="script-ep-list">
            {project.episodes.map((episode) => (
              <li key={episode.id}>
                <button
                  type="button"
                  className={episode.id === selected?.id ? 'on' : ''}
                  onClick={() => setSelectedId(episode.id)}
                >
                  <b>EP {padEp(episode.number)}</b>
                  <span>{episode.title || '未命名'}</span>
                  <i
                    className={
                      episodeHasClips(episode)
                        ? 'mark script'
                        : episodeHasScript(episode)
                          ? 'mark outline'
                          : 'mark'
                    }
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {selected ? (
        <div className="board-main">
          <header className="page-head">
            <div>
              <p className="eyebrow">
                第 {padEp(selected.number)} 集 · MiniMax H3
              </p>
              <h1>按场次写出可投喂的提示词</h1>
            </div>
            <button type="button" className="btn gold" disabled={busy} onClick={generate}>
              {busy ? '生成中…' : '按本集剧本生成'}
            </button>
          </header>
          <p className="lead">
            每个场景对应一条 5–10 秒的 H3 镜头包，提示词里带时间轴、角色锁定、对白口型和声画。后面你把这些提示词丢进自己的 H3 工作流即可。
            {online ? ' 剧目会同步到后端。' : ' 后端未连接，提示词仍可在本机生成。'}
          </p>
          {error ? <p className="board-error">{error}</p> : null}

          {selected.clips.length === 0 ? (
            <EmptyHint
              title="还没有 H3 提示词"
              text="先写好本集剧本，再点右上角生成。生成后仍可逐条改提示词。"
            />
          ) : (
            <div className="clip-list">
              {selected.clips.map((clip) => (
                <article key={clip.id} className="clip-card">
                  <div className="clip-top">
                    <strong>
                      镜头 {clip.number} · {clip.duration}s
                    </strong>
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() => void copyPrompt(clip)}
                    >
                      {copied === clip.id ? '已复制' : '复制提示词'}
                    </button>
                  </div>
                  <Field label="场景头">
                    <input
                      value={clip.heading}
                      onChange={(event) =>
                        patchClip(selected.id, clip.id, { heading: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="时长（秒）" hint="H3 支持 4–15 秒">
                    <input
                      type="number"
                      min={4}
                      max={15}
                      value={clip.duration}
                      onChange={(event) =>
                        patchClip(selected.id, clip.id, {
                          duration: Math.min(15, Math.max(4, Number(event.target.value) || 6)),
                        })
                      }
                    />
                  </Field>
                  <Field label="H3 提示词">
                    <AutoTextarea
                      className="h3-prompt"
                      rows={12}
                      value={clip.prompt}
                      onChange={(event) =>
                        patchClip(selected.id, clip.id, { prompt: event.target.value })
                      }
                    />
                  </Field>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyHint title="没有可拆的集" text="先到大纲页生成分集。" />
      )}
    </div>
  )
}
