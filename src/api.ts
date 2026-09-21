import type { H3Clip, Project, Workspace } from './types'

const API = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) {
    let detail = `请求失败（${response.status}）`
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      /* empty */
    }
    throw new Error(detail)
  }
  return (await response.json()) as T
}

export async function pingHealth(): Promise<boolean> {
  try {
    const result = await request<{ status: string }>('/health')
    return result.status === 'ok'
  } catch {
    return false
  }
}

export async function fetchWorkspace(): Promise<Workspace | null> {
  try {
    const result = await request<{ projects: Project[] }>('/projects')
    if (!Array.isArray(result.projects)) return null
    return {
      projects: result.projects,
      activeId: result.projects[0]?.id ?? null,
    }
  } catch {
    return null
  }
}

export async function saveProject(project: Project): Promise<void> {
  await request(`/projects/${project.id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  })
}

export async function deleteProjectRemote(id: string): Promise<void> {
  await request(`/projects/${id}`, { method: 'DELETE' })
}

export async function buildStoryboard(
  project: Project,
  episodeId: string,
): Promise<H3Clip[]> {
  const result = await request<{ clips: H3Clip[] }>('/storyboard', {
    method: 'POST',
    body: JSON.stringify({ project, episodeId }),
  })
  return result.clips
}
