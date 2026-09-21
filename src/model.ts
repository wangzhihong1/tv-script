import type {
  Character,
  CharacterRole,
  DialogueLine,
  EndingType,
  Episode,
  EpisodeMarker,
  H3Clip,
  HookType,
  Project,
  Scene,
  Tone,
  VillainLayer,
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
  const person = {
    id: uid(),
    name: '',
    role: 'supporting' as CharacterRole,
    villainLayer: 'none' as VillainLayer,
    tag: '',
    secret: '',
    relationship: '',
    notes: '',
    ...partial,
  }
  return {
    ...person,
    villainLayer: person.villainLayer ?? 'none',
  }
}

export function createClip(partial?: Partial<H3Clip>): H3Clip {
  return {
    id: uid(),
    sceneId: '',
    number: 1,
    duration: 6,
    heading: '',
    prompt: '',
    ...partial,
  }
}

export function createEpisode(number: number, partial?: Partial<Episode>): Episode {
  const episode = {
    id: uid(),
    number,
    title: '',
    hookTitle: '',
    hookType: '' as HookType | '',
    marker: 'normal' as EpisodeMarker,
    opening: '',
    middle: '',
    endingHook: '',
    nextPreview: '',
    notes: '',
    scenes: [],
    clips: [] as H3Clip[],
    ...partial,
  }
  return {
    ...episode,
    number: episode.number || number,
    hookType: episode.hookType ?? '',
    marker: episode.marker ?? 'normal',
    scenes: episode.scenes ?? [],
    clips: (episode.clips ?? []).map((clip) => createClip(clip)),
  }
}

export function createProject(partial?: Partial<Project>): Project {
  const now = Date.now()
  const merged = {
    id: uid(),
    title: '未命名短剧',
    genre: '霸总逆袭',
    audience: 'female' as const,
    tone: 'sweet_hurt' as Tone,
    endingType: 'he' as EndingType,
    targetEpisodes: 80,
    logline: '',
    world: '',
    story: '',
    createdAt: now,
    updatedAt: now,
    characters: [] as Character[],
    episodes: [] as Episode[],
    ...partial,
  }
  return {
    ...merged,
    tone: merged.tone ?? 'sweet_hurt',
    endingType: merged.endingType ?? 'he',
    world: merged.world ?? '',
    story: merged.story ?? '',
    characters: (merged.characters ?? []).map((person) =>
      createCharacter({
        ...person,
        villainLayer:
          person.villainLayer ?? (person.role === 'antagonist' ? 'mid' : 'none'),
      }),
    ),
    episodes: (merged.episodes ?? []).map((episode, index) =>
      createEpisode(episode.number ?? index + 1, episode),
    ),
  }
}

export type RhythmPhase = 'rise' | 'climb' | 'storm' | 'finale'

export const PHASE_LABELS: Record<RhythmPhase, string> = {
  rise: '起势',
  climb: '攀升',
  storm: '风暴',
  finale: '决战',
}

export function episodePhase(number: number, target: number): RhythmPhase {
  const ratio = number / Math.max(target, 1)
  if (ratio <= 0.15) return 'rise'
  if (ratio <= 0.45) return 'climb'
  if (ratio <= 0.8) return 'storm'
  return 'finale'
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

export function episodeHasClips(episode: Episode): boolean {
  return episode.clips.some((clip) => clip.prompt.trim().length > 0)
}

export function projectCompletion(project: Project): number {
  const loglineScore = project.logline.trim() ? 10 : 0
  const storyScore = project.story.trim() ? 15 : 0
  const characterScore = Math.min(project.characters.length, 4) * 5
  const target = Math.max(project.episodes.length, 1)
  const outlineScore =
    (project.episodes.reduce((sum, episode) => sum + episodeOutlineFilled(episode) / 3, 0) /
      target) *
    35
  const scriptTarget = Math.max(Math.min(project.episodes.length, 10), 1)
  const scripted = project.episodes
    .slice(0, scriptTarget)
    .filter(episodeHasScript).length
  const scriptScore = (scripted / scriptTarget) * 20
  return Math.round(
    Math.min(100, loglineScore + storyScore + characterScore + outlineScore + scriptScore),
  )
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
