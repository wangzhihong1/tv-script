import type { Workspace } from './types'

const KEY = 'tvscript.workspace.v1'

export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { projects: [], activeId: null }
    const parsed = JSON.parse(raw) as Workspace
    if (!Array.isArray(parsed.projects)) return { projects: [], activeId: null }
    return {
      projects: parsed.projects,
      activeId: parsed.activeId ?? parsed.projects[0]?.id ?? null,
    }
  } catch {
    return { projects: [], activeId: null }
  }
}

export function saveWorkspace(workspace: Workspace): void {
  localStorage.setItem(KEY, JSON.stringify(workspace))
}
