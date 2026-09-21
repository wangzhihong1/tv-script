export type Audience = 'female' | 'male' | 'mixed'
export type Tone = 'sweet' | 'hurt' | 'sweet_hurt' | 'payoff' | 'burn' | 'comedy'
export type EndingType = 'he' | 'be' | 'oe'
export type HookType = 'suspense' | 'reversal' | 'emotion' | 'info' | 'crisis'
export type EpisodeMarker = 'normal' | 'key' | 'paywall'
export type VillainLayer = 'none' | 'minor' | 'mid' | 'major' | 'hidden'
export type CharacterRole = 'protagonist' | 'love_interest' | 'antagonist' | 'supporting'
export type View =
  | 'story'
  | 'settings'
  | 'characters'
  | 'outline'
  | 'script'
  | 'check'
  | 'board'
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

export const TONE_LABELS: Record<Tone, string> = {
  sweet: '甜',
  hurt: '虐',
  sweet_hurt: '甜虐',
  payoff: '爽',
  burn: '燃',
  comedy: '搞笑',
}

export const ENDING_LABELS: Record<EndingType, string> = {
  he: 'HE 好结局',
  be: 'BE 坏结局',
  oe: 'OE 开放结局',
}

export const HOOK_LABELS: Record<HookType, string> = {
  suspense: '悬念钩',
  reversal: '反转钩',
  emotion: '情绪钩',
  info: '信息钩',
  crisis: '危机钩',
}

export const MARKER_LABELS: Record<EpisodeMarker, string> = {
  normal: '常规集',
  key: '重点集',
  paywall: '付费卡点',
}

export const VILLAIN_LAYER_LABELS: Record<VillainLayer, string> = {
  none: '不是反派',
  minor: '小反派',
  mid: '中反派',
  major: '大反派',
  hidden: '隐藏反派',
}

export const VIEW_LABELS: Record<View, string> = {
  story: '故事',
  settings: '设定',
  characters: '人物',
  outline: '大纲',
  script: '剧本',
  check: '检查',
  board: '分镜',
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

export type H3Clip = {
  id: string
  sceneId: string
  number: number
  duration: number
  heading: string
  prompt: string
}

export type Character = {
  id: string
  name: string
  role: CharacterRole
  villainLayer: VillainLayer
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
  hookType: HookType | ''
  marker: EpisodeMarker
  opening: string
  middle: string
  endingHook: string
  nextPreview: string
  notes: string
  scenes: Scene[]
  clips: H3Clip[]
}

export type Project = {
  id: string
  title: string
  genre: string
  audience: Audience
  tone: Tone
  endingType: EndingType
  targetEpisodes: number
  logline: string
  world: string
  story: string
  createdAt: number
  updatedAt: number
  characters: Character[]
  episodes: Episode[]
}

export type Workspace = {
  projects: Project[]
  activeId: string | null
}
