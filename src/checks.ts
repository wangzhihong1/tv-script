import type { Episode, Project, View } from './types'
import { episodeHasScript, episodeOutlineFilled, namesByRole } from './model'

export type CheckLevel = 'must' | 'should'
export type CheckItem = {
  id: string
  level: CheckLevel
  pass: boolean
  title: string
  detail: string
  goto?: View
}

function hasText(value: string | undefined): boolean {
  return Boolean(value && value.trim())
}

function endingHookCoverage(episodes: Episode[]): number {
  if (episodes.length === 0) return 0
  const filled = episodes.filter((episode) => hasText(episode.endingHook)).length
  return filled / episodes.length
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

  return [
    {
      id: 'logline',
      level: 'must',
      pass: hasText(project.logline),
      title: '一句话卖点',
      detail: hasText(project.logline)
        ? project.logline
        : '还没有 logline。短剧要用一句话讲清身份反差和核心冲突。',
      goto: 'settings',
    },
    {
      id: 'lead',
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
      level: 'must',
      pass: antagonists.length > 0,
      title: '反派会持续作恶',
      detail:
        antagonists.length > 0
          ? `反派：${antagonists.join('、')}`
          : '没有反派，打脸就没有落点。给反派一个每集都能伤害主角的手段。',
      goto: 'characters',
    },
    {
      id: 'love',
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
      level: 'must',
      pass: Boolean(ep1 && episodeHasScript(ep1)),
      title: '第 1 集已写成剧本',
      detail: ep1 && episodeHasScript(ep1) ? '前三集里，第一集最贵，已经有场景对白。' : '先把第一集写成可拍的场景和对白。',
      goto: 'script',
    },
    {
      id: 'hooks',
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
      level: 'should',
      pass:
        project.episodes.length > 0 &&
        scripted >= Math.min(3, project.episodes.length),
      title: '前 3 集精写',
      detail: `已写剧本 ${scripted} 集。前 3 集决定留存，建议先精写再铺后面。`,
      goto: 'script',
    },
  ]
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

export function checkScore(items: CheckItem[]): number {
  if (items.length === 0) return 0
  const weighted = items.reduce((sum, item) => sum + (item.pass ? (item.level === 'must' ? 2 : 1) : 0), 0)
  const total = items.reduce((sum, item) => sum + (item.level === 'must' ? 2 : 1), 0)
  return Math.round((weighted / total) * 100)
}
