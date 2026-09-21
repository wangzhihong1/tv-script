import { useState } from 'react'
import type { Project, View } from './types'
import { AUDIENCE_LABELS, VIEW_LABELS } from './types'
import { projectCompletion } from './model'
import { useWorkspace } from './store'
import { NewProjectModal } from './components/NewProjectModal'
import { SettingsView } from './components/SettingsView'
import { StoryView } from './components/StoryView'
import { CharactersView } from './components/CharactersView'
import { OutlineView } from './components/OutlineView'
import { ScriptView } from './components/ScriptView'
import { CheckView } from './components/CheckView'
import { BoardView } from './components/BoardView'
import { ExportView } from './components/ExportView'

const VIEWS: View[] = ['story', 'settings', 'characters', 'outline', 'script', 'check', 'board', 'export']

export default function App() {
  const {
    projects,
    active,
    activeId,
    setActiveId,
    updateActive,
    createBlank,
    createWorldEnd,
    removeProject,
    duplicateProject,
    status,
    error,
    retry,
  } = useWorkspace()
  const [view, setView] = useState<View>('story')
  const [creating, setCreating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function apply(project: Project) {
    updateActive(() => project)
  }

  function openCreated() {
    setCreating(false)
    setView('story')
    setSidebarOpen(false)
  }

  return (
    <div className="app">
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <span className="mark">TV</span>
          <div>
            <strong>TvScript</strong>
            <em>
              {status === 'ready'
                ? '短剧工坊'
                : status === 'loading'
                  ? '正在读取数据库'
                  : '后端未连接'}
            </em>
          </div>
        </div>
        <button
          type="button"
          className="btn gold wide"
          disabled={status !== 'ready'}
          onClick={() => setCreating(true)}
        >
          新建剧目
        </button>
        <div className="project-list">
          {projects.length === 0 ? (
            <p className="quiet pad">
              {status === 'loading'
                ? '正在读取项目数据库…'
                : status === 'error'
                  ? '连不上数据库，先启动后端。'
                  : '还没有剧目。先写故事，或载入《世界末日》。'}
            </p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={project.id === activeId ? 'project-item on' : 'project-item'}
                onClick={() => {
                  setActiveId(project.id)
                  setSidebarOpen(false)
                }}
              >
                <span className="project-title">{project.title || '未命名短剧'}</span>
                <span className="project-meta">
                  {project.genre} · {AUDIENCE_LABELS[project.audience]}
                </span>
                <i style={{ width: `${projectCompletion(project)}%` }} />
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="stage">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu"
            aria-label="打开剧目列表"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            ☰
          </button>
          <div className="crumbs">
            <b>{active?.title || '未选择剧目'}</b>
            {active ? <span>{active.logline || '还没有一句话卖点'}</span> : null}
          </div>
          {active ? (
            <div className="top-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => duplicateProject(active.id)}
              >
                复制
              </button>
              <button
                type="button"
                className="btn danger-text"
                onClick={() => {
                  if (confirm(`删除《${active.title}》？此操作不能恢复。`)) {
                    removeProject(active.id)
                  }
                }}
              >
                删除
              </button>
            </div>
          ) : null}
        </header>

        {status === 'loading' ? (
          <main className="welcome">
            <p className="eyebrow">项目数据库</p>
            <h1>正在读取剧目</h1>
            <p>稿件只存在本项目的 data/tvscript.db，不会写入浏览器。</p>
          </main>
        ) : status === 'error' ? (
          <main className="welcome">
            <p className="eyebrow">无法落盘</p>
            <h1>后端还没连上</h1>
            <p>{error}</p>
            <div className="welcome-actions">
              <button type="button" className="btn gold" onClick={() => void retry()}>
                重新连接
              </button>
            </div>
          </main>
        ) : active ? (
          <>
            <nav className="tabs">
              {VIEWS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={view === item ? 'on' : ''}
                  onClick={() => setView(item)}
                >
                  {VIEW_LABELS[item]}
                </button>
              ))}
            </nav>
            <main className="main">
              {view === 'story' ? <StoryView project={active} onChange={apply} /> : null}
              {view === 'settings' ? (
                <SettingsView project={active} onChange={apply} />
              ) : null}
              {view === 'characters' ? (
                <CharactersView project={active} onChange={apply} />
              ) : null}
              {view === 'outline' ? (
                <OutlineView project={active} onChange={apply} />
              ) : null}
              {view === 'script' ? (
                <ScriptView project={active} onChange={apply} />
              ) : null}
              {view === 'check' ? (
                <CheckView project={active} onGoto={setView} />
              ) : null}
              {view === 'board' ? (
                <BoardView project={active} onChange={apply} />
              ) : null}
              {view === 'export' ? <ExportView project={active} /> : null}
            </main>
          </>
        ) : (
          <main className="welcome">
            <p className="eyebrow">先故事，再剧本，再分镜</p>
            <h1>
              三秒抓住人
              <br />
              每集卖掉下一集
            </h1>
            <p>
              以《世界末日》为例：先立故事和人物，再写成场次对白，最后拆成 MiniMax H3 提示词。
              成片工作流后面再接。剧目只存在本项目的 data/tvscript.db，换电脑拉仓库就能接着写。
            </p>
            <div className="welcome-actions">
              <button type="button" className="btn gold" onClick={() => {
                createWorldEnd()
                setView('story')
              }}>
                打开《世界末日》
              </button>
              <button type="button" className="btn ghost" onClick={() => setCreating(true)}>
                新建剧目
              </button>
            </div>
          </main>
        )}
      </div>

      {sidebarOpen ? (
        <button
          type="button"
          className="scrim"
          aria-label="关闭侧栏"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {creating ? (
        <NewProjectModal
          onClose={() => setCreating(false)}
          onCreate={(partial) => {
            createBlank(partial)
            openCreated()
          }}
          onWorldEnd={() => {
            createWorldEnd()
            setView('story')
            setCreating(false)
            setSidebarOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
