export type Audience = 'female' | 'male' | 'mixed'
export type CharacterRole = 'protagonist' | 'love_interest' | 'antagonist' | 'supporting'
export type View =
  | 'settings'
  | 'characters'
  | 'outline'
  | 'script'
  | 'check'
  | 'export'

export const GENRES = [
  '霸总逆袭',
  '复仇虐恋',
  '甜宠萌宝',
  '穿越重生',
  '职场商战',
  '悬疑犯罪',
  '古装权谋',
  '末日求生',
  '其他',
] as const

export const ROLE_LABELS: Record<CharacterRole, string> = {
  protagonist: '主角',
  love_interest: '爱情线',
  antagonist: '反派',
  supporting: '配角',
}

export const AUDIENCE_LABELS: Record<Audience, string> = {
  female: '女频',
  male: '男频',
  mixed: '男女频',
}

export const VIEW_LABELS: Record<View, string> = {
  settings: '设定',
  characters: '人物',
  outline: '大纲',
  script: '剧本',
  check: '钩子',
  export: '导出',
}

export type DialogueLine = {
  id: string
  character: string
  line: string
}

export type Scene = {
  id: string
  heading: string
  action: string
  dialogues: DialogueLine[]
}

export type Character = {
  id: string
  name: string
  role: CharacterRole
  tag: string
  secret: string
  relationship: string
  notes: string
}

export type Episode = {
  id: string
  number: number
  title: string
  hookTitle: string
  opening: string
  middle: string
  endingHook: string
  nextPreview: string
  notes: string
  scenes: Scene[]
}

export type Project = {
  id: string
  title: string
  genre: string
  audience: Audience
  targetEpisodes: number
  logline: string
  createdAt: number
  updatedAt: number
  characters: Character[]
  episodes: Episode[]
}

export type Workspace = {
  projects: Project[]
  activeId: string | null
}
