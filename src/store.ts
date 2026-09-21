import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Project, Workspace } from './types'
import { loadWorkspace, saveWorkspace } from './storage'
import { createProject, touch } from './model'
import { createSampleProject } from './sample'
import { createWorldEndProject } from './worldEnd'

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(() => loadWorkspace())

  useEffect(() => {
    saveWorkspace(workspace)
  }, [workspace])

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
      const projects = exists
        ? prev.projects.map((item) => (item.id === project.id ? touch(project) : item))
        : [touch(project), ...prev.projects]
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

  const createSample = useCallback(() => {
    const project = createSampleProject()
    upsert(project)
    return project
  }, [upsert])

  const createWorldEnd = useCallback(() => {
    const project = createWorldEndProject()
    upsert(project)
    return project
  }, [upsert])

  const removeProject = useCallback((id: string) => {
    setWorkspace((prev) => {
      const projects = prev.projects.filter((item) => item.id !== id)
      const activeId =
        prev.activeId === id ? (projects[0]?.id ?? null) : prev.activeId
      return { projects, activeId }
    })
  }, [])

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
    setActiveId,
    updateActive,
    createBlank,
    createSample,
    createWorldEnd,
    removeProject,
    duplicateProject,
  }
}
