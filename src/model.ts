import type {
  Character,
  CharacterRole,
  DialogueLine,
  Episode,
  Project,
  Scene,
} from './types'

export function uid(): string {
  return crypto.randomUUID()
}

export function createDialogue(partial?: Partial<DialogueLine>): DialogueLine {
  return {
    id: uid(),
    character: '',
    line: '',
    ...partial,
  }
}

export function createScene(partial?: Partial<Scene>): Scene {
  return {
    id: uid(),
    heading: '',
    action: '',
    dialogues: [],
    ...partial,
  }
}

export function createCharacter(partial?: Partial<Character>): Character {
  return {
    id: uid(),
    name: '',
    role: 'supporting',
    tag: '',
    secret: '',
    relationship: '',
    notes: '',
    ...partial,
  }
}

export function createEpisode(number: number, partial?: Partial<Episode>): Episode {
  return {
    id: uid(),
    number,
    title: '',
    hookTitle: '',
    opening: '',
    middle: '',
    endingHook: '',
    nextPreview: '',
    notes: '',
    scenes: [],
    ...partial,
  }
}

export function createProject(partial?: Partial<Project>): Project {
  const now = Date.now()
  return {
    id: uid(),
    title: '未命名短剧',
    genre: '霸总逆袭',
    audience: 'female',
    targetEpisodes: 80,
    logline: '',
    createdAt: now,
    updatedAt: now,
    characters: [],
    episodes: [],
    ...partial,
  }
}

export function touch(project: Project): Project {
  return { ...project, updatedAt: Date.now() }
}

export function renumberEpisodes(episodes: Episode[]): Episode[] {
  return episodes.map((episode, index) => ({ ...episode, number: index + 1 }))
}

export function fillEpisodes(episodes: Episode[], target: number): Episode[] {
  const next = [...episodes]
  while (next.length < target) {
    next.push(createEpisode(next.length + 1))
  }
  return next
}

export function episodeOutlineFilled(episode: Episode): number {
  return [episode.opening, episode.middle, episode.endingHook].filter(
    (value) => value.trim().length > 0,
  ).length
}

export function episodeHasScript(episode: Episode): boolean {
  return episode.scenes.some(
    (scene) =>
      scene.heading.trim() ||
      scene.action.trim() ||
      scene.dialogues.some((line) => line.character.trim() || line.line.trim()),
  )
}

export function projectCompletion(project: Project): number {
  const loglineScore = project.logline.trim() ? 15 : 0
  const characterScore = Math.min(project.characters.length, 4) * 5
  const target = Math.max(project.episodes.length, 1)
  const outlineScore =
    (project.episodes.reduce((sum, episode) => sum + episodeOutlineFilled(episode) / 3, 0) /
      target) *
    40
  const scriptTarget = Math.max(Math.min(project.episodes.length, 10), 1)
  const scripted = project.episodes
    .slice(0, scriptTarget)
    .filter(episodeHasScript).length
  const scriptScore = (scripted / scriptTarget) * 25
  return Math.round(Math.min(100, loglineScore + characterScore + outlineScore + scriptScore))
}

export function protagonistName(project: Project): string {
  const lead = project.characters.find((person) => person.role === 'protagonist')
  return lead?.name ?? ''
}

export function namesByRole(project: Project, role: CharacterRole): string[] {
  return project.characters
    .filter((person) => person.role === role)
    .map((person) => person.name)
    .filter(Boolean)
}
