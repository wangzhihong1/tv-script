import { useState } from 'react'
import type { Project, View } from './types'
import { AUDIENCE_LABELS, VIEW_LABELS } from './types'
import { projectCompletion } from './model'
import { useWorkspace } from './store'
import { NewProjectModal } from './components/NewProjectModal'
import { SettingsView } from './components/SettingsView'
import { CharactersView } from './components/CharactersView'
import { OutlineView } from './components/OutlineView'
import { ScriptView } from './components/ScriptView'
import { CheckView } from './components/CheckView'
import { ExportView } from './components/ExportView'

const VIEWS: View[] = ['settings', 'characters', 'outline', 'script', 'check', 'export']

export default function App() {
  const {
    projects,
    active,
    activeId,
    setActiveId,
    updateActive,
    createBlank,
    createSample,
    createWorldEnd,
    removeProject,
    duplicateProject,
  } = useWorkspace()
  const [view, setView] = useState<View>('settings')
  const [creating, setCreating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function apply(project: Project) {
    updateActive(() => project)
  }

  function openCreated() {
    setCreating(false)
    setView('settings')
    setSidebarOpen(false)
  }

  return (
    <div className="app">
      <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <span className="mark">TV</span>
          <div>
            <strong>TvScript</strong>
            <em>短剧工坊</em>
          </div>
        </div>
        <button
          type="button"
          className="btn gold wide"
          onClick={() => setCreating(true)}
        >
          新建剧目
        </button>
        <div className="project-list">
          {projects.length === 0 ? (
            <p className="quiet pad">还没有剧目。先建一个，或载入示例。</p>
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

        {active ? (
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
              {view === 'export' ? <ExportView project={active} /> : null}
            </main>
          </>
        ) : (
          <main className="welcome">
            <p className="eyebrow">短剧不是长剧的缩写</p>
            <h1>
              三秒抓住人
              <br />
              每集卖掉下一集
            </h1>
            <p>
              在这里立卖点、写人物底牌、铺 80 集钩子，再把场景和对白写成能拍的稿。
              数据保存在本机浏览器，不会上传。
            </p>
            <div className="welcome-actions">
              <button type="button" className="btn gold" onClick={() => {
                createWorldEnd()
                setView('outline')
              }}>
                创建《世界末日》
              </button>
              <button type="button" className="btn ghost" onClick={() => setCreating(true)}>
                新建剧目
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  createSample()
                  setView('outline')
                }}
              >
                打开示例《被弃千金》
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
          onSample={() => {
            createSample()
            setView('outline')
            setCreating(false)
            setSidebarOpen(false)
          }}
          onWorldEnd={() => {
            createWorldEnd()
            setView('outline')
            setCreating(false)
            setSidebarOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
