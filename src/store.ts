import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Project, Workspace } from './types'
import { loadWorkspace, saveWorkspace } from './storage'
import { createProject, touch } from './model'
import { isRetiredSample } from './storage'
import { createWorldEndProject, fillWorldEndStory } from './worldEnd'
import { deleteProjectRemote, fetchWorkspace, pingHealth, saveProject } from './api'

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(() => loadWorkspace())
  const [online, setOnline] = useState(false)
  const synced = useRef(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    saveWorkspace(workspace)
  }, [workspace])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const healthy = await pingHealth()
      if (cancelled) return
      setOnline(healthy)
      if (!healthy) return
      const remote = await fetchWorkspace()
      if (cancelled || !remote) return
      setWorkspace((local) => {
        if (synced.current) return local
        synced.current = true
        if (remote.projects.length === 0) {
          for (const project of local.projects) {
            void saveProject(project)
          }
          return local
        }
        const hydrated = remote.projects
          .map((project) => fillWorldEndStory(createProject(project)))
          .filter((project) => {
            if (!isRetiredSample(project)) return true
            void deleteProjectRemote(project.id)
            return false
          })
        const activeId =
          local.activeId && hydrated.some((project) => project.id === local.activeId)
            ? local.activeId
            : (hydrated[0]?.id ?? null)
        return { projects: hydrated, activeId }
      })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!online) return
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      for (const project of workspace.projects) {
        void saveProject(project)
      }
    }, 500)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [online, workspace.projects])

  const active = useMemo(
    () => workspace.projects.find((project) => project.id === workspace.activeId) ?? null,
    [workspace],
  )

  const setActiveId = useCallback((id: string | null) => {
    setWorkspace((prev) => ({ ...prev, activeId: id }))
  }, [])

  const upsert = useCallback((project: Project) => {
    setWorkspace((prev) => {
      const exists = prev.projects.some((item) => item.id === project.id)
      const next = touch(project)
      const projects = exists
        ? prev.projects.map((item) => (item.id === project.id ? next : item))
        : [next, ...prev.projects]
      return { projects, activeId: project.id }
    })
  }, [])

  const updateActive = useCallback((updater: (project: Project) => Project) => {
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

  const createBlank = useCallback((partial?: Partial<Project>) => {
    const project = createProject(partial)
    upsert(project)
    return project
  }, [upsert])

  const createWorldEnd = useCallback(() => {
    const project = createWorldEndProject()
    upsert(project)
    return project
  }, [upsert])

  const removeProject = useCallback((id: string) => {
    if (online) void deleteProjectRemote(id)
    setWorkspace((prev) => {
      const projects = prev.projects.filter((item) => item.id !== id)
      const activeId =
        prev.activeId === id ? (projects[0]?.id ?? null) : prev.activeId
      return { projects, activeId }
    })
  }, [online])

  const duplicateProject = useCallback((id: string) => {
    const source = workspace.projects.find((item) => item.id === id)
    if (!source) return
    const copy = createProject({
      ...structuredClone(source),
      id: crypto.randomUUID(),
      title: `${source.title} 副本`,
      createdAt: Date.now(),
    })
    upsert(copy)
  }, [upsert, workspace.projects])

  return {
    projects: workspace.projects,
    activeId: workspace.activeId,
    active,
    online,
    setActiveId,
    updateActive,
    createBlank,
    createWorldEnd,
    removeProject,
    duplicateProject,
  }
}
