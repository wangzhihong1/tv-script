import type { Episode, H3Clip, Project, Scene } from './types'
import { createClip } from './model'

const TONE_CN: Record<string, string> = {
  sweet: '甜',
  hurt: '虐',
  sweet_hurt: '甜虐',
  payoff: '爽',
  burn: '燃',
  comedy: '搞笑',
}

const HOOK_CN: Record<string, string> = {
  suspense: '悬念',
  reversal: '反转',
  emotion: '情绪',
  info: '信息披露',
  crisis: '危机',
}

const CLOSEUP_WORDS = [
  '鉴定',
  '戒指',
  '血',
  '门',
  '屏幕',
  '玉佩',
  '船票',
  '伤疤',
  '心脏',
  '报告',
]

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function timestamp(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

function splitAction(action: string): string[] {
  const chunks = action
    .split(/[。；;\n]+/)
    .map((part) => part.replace(/^[，,]+|[，,]+$/g, '').trim())
    .filter(Boolean)
  if (!chunks.length && action) return [action]
  if (chunks.length <= 3) return chunks
  const head = chunks.slice(0, -1)
  const tail = chunks[chunks.length - 1]
  const mid = Math.max(1, Math.floor(head.length / 2))
  return [`${head.slice(0, mid).join('。')}。`, `${head.slice(mid).join('。')}。`, `${tail}。`]
}

function shotSize(part: string, index: number, total: number): string {
  if (CLOSEUP_WORDS.some((word) => part.includes(word))) return '特写'
  if (index === 0) return total > 1 ? '全景' : '中景'
  if (index === total - 1) return '特写'
  return index % 2 ? '近景' : '中景'
}

function parseHeading(heading: string): { interior: string; time: string; place: string } {
  const raw = heading.replace(/·/g, ' ').replace(/／/g, ' ')
  const interior = raw.includes('外') ? '外' : '内'
  const time = raw.includes('夜') ? '夜' : '日'
  const place =
    raw
      .replace(/场景\s*\d+/g, '')
      .replace(/\b(内|外|日|夜)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[-·\s]+|[-·\s]+$/g, '') || '未标明地点'
  return { interior, time, place }
}

function soundscape(interior: string, time: string, genre: string): string {
  if (genre.includes('末日')) return '警报余响、碎石与风声，对白压过环境。'
  if (interior === '外' && time === '夜') return '夜风、远处车声，对白清晰，不要嘈杂人潮盖过人声。'
  if (interior === '外') return '日间环境底噪克制，对白贴耳。'
  if (time === '夜') return '室内低频环境声，玻璃与脚步可闻，对白清楚。'
  return '室内安静现场声，对白清楚，不要背景音乐盖过人声。'
}

function music(hook: string, tone: string, genre: string): string {
  if (hook === 'crisis') return '低弦骤紧，短促不安，不要完整旋律。'
  if (hook === 'reversal') return '反转落点加一声冷钢琴或弦乐刺音，随即收住。'
  if (hook === 'emotion' || tone === 'sweet' || tone === 'sweet_hurt') {
    return '克制的钢琴或弦乐垫底，情绪到了再抬，不要甜腻。'
  }
  if (genre.includes('末日') || tone === 'burn') return '低频脉冲与远处轰鸣，燃点才给鼓点。'
  return '极简氛围垫，服务对白，不要主题曲抢戏。'
}

function dialogues(scene: Scene): string[] {
  const rows: string[] = []
  for (const item of scene.dialogues) {
    const line = text(item.line)
    if (!line) continue
    rows.push(`${text(item.character) || '角色'}：${line}`)
  }
  return rows
}

function sceneCast(scene: Scene): string[] {
  const names: string[] = []
  for (const item of scene.dialogues) {
    const name = text(item.character)
    if (name && !names.includes(name)) names.push(name)
  }
  return names
}

function characterLock(project: Project, names: string[]): string {
  const wanted = new Set(names.filter(Boolean))
  const lines: string[] = []
  for (const person of project.characters) {
    const name = text(person.name)
    if (!name || (wanted.size && !wanted.has(name))) continue
    const bits = [name]
    if (text(person.tag)) bits.push(text(person.tag))
    lines.push(`- ${bits.join('，')}。全程同一张脸、同一套造型，不要换人。`)
  }
  if (!lines.length) return '- 保持本场出场人物身份前后一致，不要换脸。'
  return lines.join('\n')
}

function usableScene(scene: Scene): boolean {
  return Boolean(
    text(scene.heading) ||
      text(scene.action) ||
      scene.dialogues.some((line) => text(line.line)),
  )
}

export function buildClipPrompt(
  project: Project,
  episode: Episode,
  scene: Scene,
  options: { duration: number; beats: Array<[string, string]>; isLast: boolean },
): string {
  const genre = text(project.genre) || '短剧'
  const tone = TONE_CN[project.tone] ?? '甜虐'
  const hook = text(episode.hookType)
  const hookCn = HOOK_CN[hook] ?? '冲突'
  const heading = text(scene.heading) || '场景'
  const { interior, time, place } = parseHeading(heading)
  const spoken = dialogues(scene)
  const lock = characterLock(project, sceneCast(scene))
  const { duration, beats, isLast } = options
  const span = Math.max(duration / Math.max(beats.length, 1), 1.5)

  const timeline: string[] = []
  let cursor = 0
  beats.forEach(([size, action], index) => {
    const start = cursor
    const end = index === beats.length - 1 ? duration : Math.min(duration, cursor + span)
    timeline.push(`[Shot ${index + 1}] ${timestamp(start)}-${timestamp(end)} △${size}：${action}`)
    cursor = end
  })
  if (isLast && text(episode.endingHook)) {
    timeline.push(`结尾必须落在这个钩子画面：${text(episode.endingHook)}`)
  }

  return [
    `${duration}秒、9:16竖屏真人短剧镜头。不要烧录字幕，不要台标，不要慢动作炫技。`,
    `题材：${genre}。调性：${tone}。对标国内竖屏短剧，电影感，人物以中近景和特写为主。`,
    `【剧名】《${text(project.title) || '未命名短剧'}》`,
    `【本集】第${episode.number || 1}集《${text(episode.title) || '未命名'}》`,
    `【场景】${interior}景 · ${place} · ${time}`,
    `【情绪】${hookCn}`,
    '',
    '角色锁定：',
    lock,
    '',
    '分镜时间轴：',
    ...timeline,
    '',
    '对白（口型同步，中文，语气干脆）：',
    spoken.length ? spoken.join('\n') : '本镜以动作和反应为主，少对白。',
    '',
    '镜头运动：稳定跟拍，切点干净，景别按时间轴切换。',
    `overall_soundscape: ${soundscape(interior, time, genre)}`,
    `non_diegetic_music: ${music(hook, project.tone, genre)}`,
  ].join('\n')
}

export function buildEpisodeClips(project: Project, episodeId: string): H3Clip[] {
  const episode = project.episodes.find((item) => item.id === episodeId)
  if (!episode) throw new Error('找不到这一集')
  const scenes = episode.scenes.filter(usableScene)
  if (!scenes.length) throw new Error('这一集还没有可拍的场景。先把剧本写成场次和对白。')

  return scenes.map((scene, index) => {
    const action = text(scene.action) || text(scene.heading) || '冲突发生。'
    const parts = splitAction(action)
    const beats: Array<[string, string]> = (parts.length ? parts : [action]).map((part, beatIndex, list) => [
      shotSize(part, beatIndex, list.length),
      part,
    ])
    const duration = Math.min(10, Math.max(5, 4 + beats.length + Math.min(2, Math.floor(dialogues(scene).length / 2))))
    return createClip({
      sceneId: scene.id,
      number: index + 1,
      duration,
      heading: text(scene.heading) || `镜头${index + 1}`,
      prompt: buildClipPrompt(project, episode, scene, {
        duration,
        beats,
        isLast: index === scenes.length - 1,
      }),
    })
  })
}

export function attachStoryboard(project: Project): Project {
  return {
    ...project,
    episodes: project.episodes.map((episode) => {
      try {
        return { ...episode, clips: buildEpisodeClips(project, episode.id) }
      } catch {
        return episode
      }
    }),
  }
}
