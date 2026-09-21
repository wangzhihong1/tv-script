import type { Episode, HookType, Project, View, VillainLayer } from './types'
import { HOOK_LABELS, MARKER_LABELS, VILLAIN_LAYER_LABELS } from './types'
import { episodeHasClips, episodeHasScript, episodeOutlineFilled, namesByRole } from './model'

export type CheckLevel = 'must' | 'should'
export type CheckGroup = 'structure' | 'craft'
export type CheckItem = {
  id: string
  group: CheckGroup
  level: CheckLevel
  pass: boolean
  title: string
  detail: string
  goto?: View
}

const STRONG_OPENERS: HookType[] = ['suspense', 'reversal', 'crisis']

function hasText(value: string | undefined): boolean {
  return Boolean(value && value.trim())
}

function endingHookCoverage(episodes: Episode[]): number {
  if (episodes.length === 0) return 0
  const filled = episodes.filter((episode) => hasText(episode.endingHook)).length
  return filled / episodes.length
}

function longestEmptyStreak(episodes: Episode[]): number {
  let current = 0
  let max = 0
  for (const episode of episodes) {
    if (episodeOutlineFilled(episode) === 0) {
      current += 1
      max = Math.max(max, current)
    } else {
      current = 0
    }
  }
  return max
}

function longestSameHookStreak(episodes: Episode[]): { length: number; type: HookType | '' } {
  let current = 0
  let currentType: HookType | '' = ''
  let max = 0
  let maxType: HookType | '' = ''
  for (const episode of [...episodes].sort((a, b) => a.number - b.number)) {
    if (!episode.hookType) {
      current = 0
      currentType = ''
      continue
    }
    if (episode.hookType === currentType) {
      current += 1
    } else {
      currentType = episode.hookType
      current = 1
    }
    if (current > max) {
      max = current
      maxType = currentType
    }
  }
  return { length: max, type: maxType }
}

export type CraftSnapshot = {
  hooked: Episode[]
  typed: Episode[]
  keyCount: number
  paywallCount: number
  hookCounts: Record<HookType, number>
  villainLayers: Exclude<VillainLayer, 'none'>[]
  frontWindow: number
  frontKey: number
  frontPaywall: number
}

export function craftSnapshot(project: Project): CraftSnapshot {
  const hooked = project.episodes.filter((episode) => hasText(episode.endingHook))
  const typed = hooked.filter((episode) => episode.hookType)
  const frontWindow = Math.min(10, project.episodes.length)
  const front = project.episodes.slice(0, frontWindow)
  const hookCounts = {
    suspense: 0,
    reversal: 0,
    emotion: 0,
    info: 0,
    crisis: 0,
  } satisfies Record<HookType, number>
  for (const episode of typed) {
    if (episode.hookType) hookCounts[episode.hookType] += 1
  }
  const layers = [
    ...new Set(
      project.characters
        .map((person) => person.villainLayer)
        .filter((layer): layer is Exclude<VillainLayer, 'none'> => layer !== 'none'),
    ),
  ]
  return {
    hooked,
    typed,
    keyCount: project.episodes.filter((episode) => episode.marker === 'key').length,
    paywallCount: project.episodes.filter((episode) => episode.marker === 'paywall').length,
    hookCounts,
    villainLayers: layers,
    frontWindow,
    frontKey: front.filter((episode) => episode.marker === 'key').length,
    frontPaywall: front.filter((episode) => episode.marker === 'paywall').length,
  }
}

function requiredFrontKey(window: number): number {
  if (window >= 10) return 3
  if (window >= 5) return 2
  if (window >= 3) return 1
  return 0
}

function requiredFrontPaywall(window: number): number {
  if (window >= 10) return 2
  if (window >= 5) return 1
  return 0
}

export function analyzeProject(project: Project): CheckItem[] {
  const ep1 = project.episodes.find((episode) => episode.number === 1)
  const protagonists = namesByRole(project, 'protagonist')
  const antagonists = namesByRole(project, 'antagonist')
  const loves = namesByRole(project, 'love_interest')
  const lead = project.characters.find((person) => person.role === 'protagonist')
  const outlineComplete = project.episodes.filter(
    (episode) => episodeOutlineFilled(episode) === 3,
  ).length
  const scripted = project.episodes.filter(episodeHasScript).length
  const hookRate = endingHookCoverage(project.episodes)
  const emptyStreak = longestEmptyStreak(project.episodes)
  const craft = craftSnapshot(project)
  const typedRate = craft.hooked.length === 0 ? 0 : craft.typed.length / craft.hooked.length
  const hookKinds = Object.values(craft.hookCounts).filter((count) => count > 0).length
  const sameHook = longestSameHookStreak(project.episodes)
  const needKey = requiredFrontKey(craft.frontWindow)
  const needPaywall = requiredFrontPaywall(craft.frontWindow)
  const paywallRatio =
    project.episodes.length === 0 ? 0 : craft.paywallCount / project.episodes.length
  const keyRatio = project.episodes.length === 0 ? 0 : craft.keyCount / project.episodes.length
  const layerLabels = craft.villainLayers.map((layer) => VILLAIN_LAYER_LABELS[layer])

  return [
    {
      id: 'logline',
      group: 'structure',
      level: 'must',
      pass: hasText(project.logline),
      title: '一句话卖点',
      detail: hasText(project.logline)
        ? project.logline
        : '还没有 logline。短剧要用一句话讲清身份反差和核心冲突。',
      goto: 'story',
    },
    {
      id: 'story',
      group: 'structure',
      level: 'must',
      pass: hasText(project.story),
      title: '故事写完',
      detail: hasText(project.story)
        ? '已有从开头到结局的故事。'
        : '还没有故事正文。先把整件事讲完，再拆大纲和剧本。',
      goto: 'story',
    },
    {
      id: 'lead',
      group: 'structure',
      level: 'must',
      pass: protagonists.length > 0 && hasText(protagonists[0]),
      title: '主角到位',
      detail:
        protagonists.length > 0
          ? `主角：${protagonists.join('、')}`
          : '至少设置一名主角，并写清人设标签。',
      goto: 'characters',
    },
    {
      id: 'secret',
      group: 'structure',
      level: 'must',
      pass: Boolean(lead && hasText(lead.secret)),
      title: '主角有底牌',
      detail:
        lead && hasText(lead.secret)
          ? `底牌：${lead.secret}`
          : '主角必须有一个隐藏王牌：身份、证据、旧情或能力。',
      goto: 'characters',
    },
    {
      id: 'villain',
      group: 'structure',
      level: 'must',
      pass: antagonists.length > 0 || craft.villainLayers.length > 0,
      title: '反派会持续作恶',
      detail:
        antagonists.length > 0
          ? `反派：${antagonists.join('、')}`
          : craft.villainLayers.length > 0
            ? `已标反派层级：${layerLabels.join('、')}`
            : '没有反派，打脸就没有落点。给反派一个每集都能伤害主角的手段。',
      goto: 'characters',
    },
    {
      id: 'love',
      group: 'structure',
      level: 'should',
      pass: loves.length > 0,
      title: '爱情线/对手戏',
      detail:
        loves.length > 0
          ? `对手戏：${loves.join('、')}`
          : '女频短剧通常需要一个可恨可恋的对手戏对象。',
      goto: 'characters',
    },
    {
      id: 'ep1-open',
      group: 'structure',
      level: 'must',
      pass: Boolean(ep1 && hasText(ep1.opening)),
      title: '第 1 集 3 秒冲突',
      detail:
        ep1 && hasText(ep1.opening)
          ? `开场：${ep1.opening}`
          : '第一集开场必须当场砸出羞辱、秘密或生死，不要写人物小传。',
      goto: 'outline',
    },
    {
      id: 'ep1-hook',
      group: 'structure',
      level: 'must',
      pass: Boolean(ep1 && hasText(ep1.endingHook)),
      title: '第 1 集结尾钩子',
      detail:
        ep1 && hasText(ep1.endingHook)
          ? `钩子：${ep1.endingHook}`
          : '第一集结尾要抛出更大的信息差，逼观众点下一集。',
      goto: 'outline',
    },
    {
      id: 'ep1-script',
      group: 'structure',
      level: 'must',
      pass: Boolean(ep1 && episodeHasScript(ep1)),
      title: '第 1 集已写成剧本',
      detail: ep1 && episodeHasScript(ep1) ? '前三集里，第一集最贵，已经有场景对白。' : '先把第一集写成可拍的场景和对白。',
      goto: 'script',
    },
    {
      id: 'hooks',
      group: 'structure',
      level: 'must',
      pass: project.episodes.length > 0 && hookRate >= 0.8,
      title: '每集结尾钩子覆盖',
      detail:
        project.episodes.length === 0
          ? '还没有分集。先按目标集数生成大纲。'
          : `已有钩子 ${Math.round(hookRate * 100)}%。低于 80% 时，后面会明显注水。`,
      goto: 'outline',
    },
    {
      id: 'outline',
      group: 'structure',
      level: 'should',
      pass: project.episodes.length > 0 && outlineComplete / project.episodes.length >= 0.6,
      title: '三拍大纲完整度',
      detail:
        project.episodes.length === 0
          ? '大纲为空。'
          : `${outlineComplete}/${project.episodes.length} 集写完了开场、中段、钩子。`,
      goto: 'outline',
    },
    {
      id: 'streak',
      group: 'structure',
      level: 'should',
      pass: emptyStreak < 3,
      title: '没有连续空集',
      detail:
        emptyStreak >= 3
          ? `连续 ${emptyStreak} 集还是空的，观众会在这里流失。`
          : '空集没有连成片，节奏还压得住。',
      goto: 'outline',
    },
    {
      id: 'script-front',
      group: 'structure',
      level: 'should',
      pass:
        project.episodes.length > 0 &&
        scripted >= Math.min(3, project.episodes.length),
      title: '前 3 集精写',
      detail: `已写剧本 ${scripted} 集。前 3 集决定留存，建议先精写再铺后面。`,
      goto: 'script',
    },
    {
      id: 'ep1-board',
      group: 'structure',
      level: 'should',
      pass: Boolean(ep1 && episodeHasClips(ep1)),
      title: '第 1 集已出 H3 提示词',
      detail:
        ep1 && episodeHasClips(ep1)
          ? `第 1 集已拆 ${ep1.clips.length} 条 H3 镜头包。`
          : '剧本写完后，到分镜页按场次生成 MiniMax H3 提示词。',
      goto: 'board',
    },
    {
      id: 'hook-typed',
      group: 'craft',
      level: 'must',
      pass: craft.hooked.length > 0 && typedRate >= 0.8,
      title: '钩子要标类型',
      detail:
        craft.hooked.length === 0
          ? '还没有结尾钩子，先写再分类：悬念、反转、情绪、信息、危机。'
          : typedRate >= 0.8
            ? `${craft.typed.length}/${craft.hooked.length} 集已标钩子类型。`
            : `已写钩子 ${craft.hooked.length} 集，只标了 ${craft.typed.length} 集。类型一标，才知道会不会全是同一种钩。`,
      goto: 'outline',
    },
    {
      id: 'ep1-strong-hook',
      group: 'craft',
      level: 'must',
      pass: Boolean(ep1 && ep1.hookType && STRONG_OPENERS.includes(ep1.hookType)),
      title: '第 1 集用强钩子开局',
      detail:
        ep1 && ep1.hookType && STRONG_OPENERS.includes(ep1.hookType)
          ? `第 1 集是${HOOK_LABELS[ep1.hookType]}，适合逼观众留下。`
          : '第 1 集结尾优先用悬念、反转或危机，不要用纯情绪或信息披露收住。',
      goto: 'outline',
    },
    {
      id: 'hook-mix',
      group: 'craft',
      level: 'should',
      pass: craft.typed.length < 5 || hookKinds >= 3,
      title: '钩子类型要换着来',
      detail:
        craft.typed.length < 5
          ? '标满 5 集后，再看类型是否单一。'
          : hookKinds >= 3
            ? `已用 ${hookKinds} 种钩子：${Object.entries(craft.hookCounts)
                .filter(([, count]) => count > 0)
                .map(([type, count]) => `${HOOK_LABELS[type as HookType]} ${count}`)
                .join('、')}。`
            : `现在只有 ${hookKinds} 种钩子。五种里至少轮换三种，观众才不会提前猜到收束。`,
      goto: 'outline',
    },
    {
      id: 'same-hook-streak',
      group: 'craft',
      level: 'should',
      pass: sameHook.length < 3,
      title: '不要连续同一种钩',
      detail:
        sameHook.length >= 3 && sameHook.type
          ? `连续 ${sameHook.length} 集都是${HOOK_LABELS[sameHook.type]}。换一种打法，节奏才有呼吸。`
          : '同类型钩子没有连成片。',
      goto: 'outline',
    },
    {
      id: 'front-markers',
      group: 'craft',
      level: 'should',
      pass:
        craft.frontWindow === 0 ||
        (craft.frontKey >= needKey && craft.frontPaywall >= needPaywall),
      title: '前段要有重点和卡点',
      detail:
        craft.frontWindow === 0
          ? '还没有分集。'
          : craft.frontKey >= needKey && craft.frontPaywall >= needPaywall
            ? `前 ${craft.frontWindow} 集：${MARKER_LABELS.key} ${craft.frontKey}、${MARKER_LABELS.paywall} ${craft.frontPaywall}。`
            : `前 ${craft.frontWindow} 集建议至少 ${needKey} 个重点集、${needPaywall} 个付费卡点。现在是重点 ${craft.frontKey}、卡点 ${craft.frontPaywall}。`,
      goto: 'outline',
    },
    {
      id: 'rhythm-marks',
      group: 'craft',
      level: 'should',
      pass:
        project.episodes.length < 8 ||
        (keyRatio >= 0.2 && keyRatio <= 0.4 && paywallRatio >= 0.08 && paywallRatio <= 0.18),
      title: '重点集和付费墙配比',
      detail:
        project.episodes.length < 8
          ? '满 8 集后再看全剧配比：重点集约 25–35%，付费卡点约 10–15%。'
          : `重点集 ${Math.round(keyRatio * 100)}%，付费卡点 ${Math.round(paywallRatio * 100)}%。目标大约是 25–35% 和 10–15%。`,
      goto: 'outline',
    },
    {
      id: 'villain-stack',
      group: 'craft',
      level: 'should',
      pass: craft.villainLayers.length >= 2,
      title: '反派至少两层',
      detail:
        craft.villainLayers.length >= 2
          ? `已分层：${layerLabels.join('、')}。`
          : '不要只有一个反派撑全剧。至少再加一层：前期小反派，或后期隐藏反派。',
      goto: 'characters',
    },
  ]
}

export function checkScore(items: CheckItem[]): number {
  if (items.length === 0) return 0
  const weighted = items.reduce((sum, item) => sum + (item.pass ? (item.level === 'must' ? 2 : 1) : 0), 0)
  const total = items.reduce((sum, item) => sum + (item.level === 'must' ? 2 : 1), 0)
  return Math.round((weighted / total) * 100)
}
