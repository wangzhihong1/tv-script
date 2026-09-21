import { createProject } from './model'
import type { Project, Workspace } from './types'
import { fillWorldEndStory } from './worldEnd'

const KEY = 'tvscript.workspace.v1'

export function isRetiredSample(project: Pick<Project, 'title'>): boolean {
  return /被弃千金|背弃千金/.test(project.title.trim())
}

export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { projects: [], activeId: null }
    const parsed = JSON.parse(raw) as Workspace
    if (!Array.isArray(parsed.projects)) return { projects: [], activeId: null }
    const projects = parsed.projects
      .map((project) => fillWorldEndStory(createProject(project)))
      .filter((project) => !isRetiredSample(project))
    const activeId =
      parsed.activeId && projects.some((project) => project.id === parsed.activeId)
        ? parsed.activeId
        : (projects[0]?.id ?? null)
    return { projects, activeId }
  } catch {
    return { projects: [], activeId: null }
  }
}

export function saveWorkspace(workspace: Workspace): void {
  localStorage.setItem(KEY, JSON.stringify(workspace))
}
