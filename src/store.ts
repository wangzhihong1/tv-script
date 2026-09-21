import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Project, Workspace } from './types'
import { discardBrowserCache, isRetiredSample, takeBrowserLegacy } from './storage'
import { createProject, touch } from './model'
import { createWorldEndProject, fillWorldEndStory } from './worldEnd'
import {
  deleteProjectRemote,
  fetchWorkspace,
  pingHealth,
  saveActiveId,
  saveProject,
} from './api'

export type WorkspaceStatus = 'loading' | 'ready' | 'error'

const EMPTY: Workspace = { projects: [], activeId: null }

function hydrate(workspace: Workspace): Workspace {
  const projects = workspace.projects
    .map((project) => fillWorldEndStory(createProject(project)))
    .filter((project) => !isRetiredSample(project))
  const activeId =
    workspace.activeId && projects.some((project) => project.id === workspace.activeId)
      ? workspace.activeId
      : (projects[0]?.id ?? null)
  return { projects, activeId }
}

async function waitForBackend(tries = 24): Promise<boolean> {
  for (let i = 0; i < tries; i += 1) {
    if (await pingHealth()) return true
    await new Promise((resolve) => window.setTimeout(resolve, 250))
  }
  return false
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(EMPTY)
  const [status, setStatus] = useState<WorkspaceStatus>('loading')
  const [error, setError] = useState('')
  const workspaceRef = useRef(workspace)
  const readyRef = useRef(false)
  const timer = useRef<number | null>(null)
  const boot = useRef(0)

  workspaceRef.current = workspace
  readyRef.current = status === 'ready'

  const persist = useCallback(async (next: Workspace) => {
    await Promise.all([
      ...next.projects.map((project) => saveProject(project)),
      saveActiveId(next.activeId),
    ])
  }, [])

  const load = useCallback(async () => {
    const token = boot.current + 1
    boot.current = token
    setStatus('loading')
    setError('')
    readyRef.current = false
    const healthy = await waitForBackend()
    if (token !== boot.current) return
    if (!healthy) {
      setWorkspace(EMPTY)
      setStatus('error')
      setError('后端未启动。剧目只存在项目目录 data/tvscript.db，不会写入浏览器。请先启动 TvScript 后端。')
      return
    }
    try {
      let remote = hydrate(await fetchWorkspace())
      if (remote.projects.length === 0) {
        const legacy = takeBrowserLegacy()
        if (legacy) {
          remote = hydrate(legacy)
          await persist(remote)
        }
      }
      discardBrowserCache()
      if (token !== boot.current) return
      setWorkspace(remote)
      setStatus('ready')
    } catch (err) {
      if (token !== boot.current) return
      setWorkspace(EMPTY)
      setStatus('error')
      setError(err instanceof Error ? err.message : '无法读取项目数据库')
    }
  }, [persist])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (status !== 'ready') return
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      void persist(workspace).catch((err: unknown) => {
        setStatus('error')
        setError(err instanceof Error ? err.message : '写入项目数据库失败')
      })
    }, 400)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [persist, status, workspace])

  useEffect(() => {
    function flush() {
      if (!readyRef.current) return
      void persist(workspaceRef.current)
    }
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [persist])

  const active = useMemo(
    () => workspace.projects.find((project) => project.id === workspace.activeId) ?? null,
    [workspace],
  )

  const setActiveId = useCallback((id: string | null) => {
    if (!readyRef.current) return
    setWorkspace((prev) => ({ ...prev, activeId: id }))
  }, [])

  const upsert = useCallback((project: Project) => {
    if (!readyRef.current) return project
    setWorkspace((prev) => {
      const exists = prev.projects.some((item) => item.id === project.id)
      const next = touch(project)
      const projects = exists
        ? prev.projects.map((item) => (item.id === project.id ? next : item))
        : [next, ...prev.projects]
      return { projects, activeId: project.id }
    })
    return project
  }, [])

  const updateActive = useCallback((updater: (project: Project) => Project) => {
    if (!readyRef.current) return
    setWorkspace((prev) => {
      if (!prev.activeId) return prev
      return {
        ...prev,
        projects: prev.projects.map((item) =>
          item.id === prev.activeId ? touch(updater(item)) : item,
        ),
      }
    })
  }, [])

  const createBlank = useCallback(
    (partial?: Partial<Project>) => {
      const project = createProject(partial)
      upsert(project)
      return project
    },
    [upsert],
  )

  const createWorldEnd = useCallback(() => {
    const project = createWorldEndProject()
    upsert(project)
    return project
  }, [upsert])

  const removeProject = useCallback((id: string) => {
    if (!readyRef.current) return
    void deleteProjectRemote(id).catch((err: unknown) => {
      setStatus('error')
      setError(err instanceof Error ? err.message : '删除失败')
    })
    setWorkspace((prev) => {
      const projects = prev.projects.filter((item) => item.id !== id)
      const activeId = prev.activeId === id ? (projects[0]?.id ?? null) : prev.activeId
      return { projects, activeId }
    })
  }, [])

  const duplicateProject = useCallback(
    (id: string) => {
      const source = workspace.projects.find((project) => project.id === id)
      if (!source) return
      const copy = createProject({
        ...structuredClone(source),
        id: crypto.randomUUID(),
        title: `${source.title} 副本`,
        createdAt: Date.now(),
      })
      upsert(copy)
    },
    [upsert, workspace.projects],
  )

  return {
    projects: workspace.projects,
    activeId: workspace.activeId,
    active,
    status,
    error,
    retry: load,
    setActiveId,
    updateActive,
    createBlank,
    createWorldEnd,
    removeProject,
    duplicateProject,
  }
}
