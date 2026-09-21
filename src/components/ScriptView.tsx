import { useEffect, useMemo, useState } from 'react'
import type { DialogueLine, Episode, Project, Scene } from '../types'
import { createDialogue, createScene, episodeHasScript, episodeOutlineFilled } from '../model'
import { AutoTextarea, EmptyHint, padEp } from './ui'

export function ScriptView({
  project,
  onChange,
}: {
  project: Project
  onChange: (project: Project) => void
}) {
  const [selectedId, setSelectedId] = useState(project.episodes[0]?.id ?? '')

  useEffect(() => {
    setSelectedId(project.episodes[0]?.id ?? '')
  }, [project.id])
  const selected =
    project.episodes.find((episode) => episode.id === selectedId) ?? project.episodes[0] ?? null
  const names = useMemo(
    () => project.characters.map((person) => person.name).filter(Boolean),
    [project.characters],
  )

  function patchEpisode(id: string, patch: Partial<Episode>) {
    onChange({
      ...project,
      episodes: project.episodes.map((episode) =>
        episode.id === id ? { ...episode, ...patch } : episode,
      ),
    })
  }

  function patchScene(episodeId: string, sceneId: string, patch: Partial<Scene>) {
    const episode = project.episodes.find((item) => item.id === episodeId)
    if (!episode) return
    patchEpisode(episodeId, {
      scenes: episode.scenes.map((scene) => (scene.id === sceneId ? { ...scene, ...patch } : scene)),
    })
  }

  function patchLine(
    episodeId: string,
    sceneId: string,
    lineId: string,
    patch: Partial<DialogueLine>,
  ) {
    const episode = project.episodes.find((item) => item.id === episodeId)
    const scene = episode?.scenes.find((item) => item.id === sceneId)
    if (!episode || !scene) return
    patchScene(episodeId, sceneId, {
      dialogues: scene.dialogues.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
    })
  }

  return (
    <div className="page split">
      <aside className="script-nav">
        <p className="eyebrow">选一集写</p>
        <h2>剧本</h2>
        {project.episodes.length === 0 ? (
          <EmptyHint title="先去大纲建集" text="没有分集就没法写剧本。" />
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
                      episodeHasScript(episode)
                        ? 'mark script'
                        : episodeOutlineFilled(episode)
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
        <div className="paper-wrap">
          {(selected.opening || selected.middle || selected.endingHook) && (
            <div className="beat-notes">
              <div>
                <span>开场</span>
                <p>{selected.opening || '—'}</p>
              </div>
              <div>
                <span>中段</span>
                <p>{selected.middle || '—'}</p>
              </div>
              <div>
                <span>钩子</span>
                <p>{selected.endingHook || '—'}</p>
              </div>
            </div>
          )}

          <article className="paper">
            <header className="paper-head">
              <input
                className="paper-ep"
                value={`第${padEp(selected.number)}集`}
                readOnly
              />
              <input
                className="paper-title"
                placeholder="集标题"
                value={selected.title}
                onChange={(event) => patchEpisode(selected.id, { title: event.target.value })}
              />
              <input
                className="paper-hook"
                placeholder="【集标题钩子】一句话预告"
                value={selected.hookTitle}
                onChange={(event) => patchEpisode(selected.id, { hookTitle: event.target.value })}
              />
            </header>

            {selected.scenes.length === 0 ? (
              <p className="paper-empty">还没有场景。从一条冲突开始，不要从天气开始。</p>
            ) : (
              selected.scenes.map((scene, index) => (
                <section key={scene.id} className="scene">
                  <div className="scene-head">
                    <input
                      value={scene.heading}
                      placeholder={`场景${index + 1}  内  地点  日`}
                      onChange={(event) =>
                        patchScene(selected.id, scene.id, { heading: event.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="btn danger-text"
                      onClick={() =>
                        patchEpisode(selected.id, {
                          scenes: selected.scenes.filter((item) => item.id !== scene.id),
                        })
                      }
                    >
                      删除场景
                    </button>
                  </div>
                  <AutoTextarea
                    className="action"
                    placeholder="（动作）顾寒当众把戒指扔进高脚杯。"
                    value={scene.action}
                    onChange={(event) =>
                      patchScene(selected.id, scene.id, { action: event.target.value })
                    }
                  />
                  <div className="dialogue-block">
                    {scene.dialogues.map((line) => (
                      <div key={line.id} className="dialogue-row">
                        <input
                          list="character-names"
                          placeholder="角色"
                          value={line.character}
                          onChange={(event) =>
                            patchLine(selected.id, scene.id, line.id, {
                              character: event.target.value,
                            })
                          }
                        />
                        <AutoTextarea
                          placeholder="对白要短，要刺，要带信息。"
                          value={line.line}
                          onChange={(event) =>
                            patchLine(selected.id, scene.id, line.id, { line: event.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="删除对白"
                          onClick={() =>
                            patchScene(selected.id, scene.id, {
                              dialogues: scene.dialogues.filter((item) => item.id !== line.id),
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() =>
                        patchScene(selected.id, scene.id, {
                          dialogues: [...scene.dialogues, createDialogue()],
                        })
                      }
                    >
                      加对白
                    </button>
                  </div>
                </section>
              ))
            )}

            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                patchEpisode(selected.id, { scenes: [...selected.scenes, createScene()] })
              }
            >
              新增场景
            </button>
          </article>
          <datalist id="character-names">
            {names.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      ) : (
        <EmptyHint title="没有可写的集" text="先到大纲页生成分集。" />
      )}
    </div>
  )
}
