import type { Episode, H3Clip, Project, Scene } from './types'
import { AUDIENCE_LABELS, HOOK_LABELS, MARKER_LABELS, ROLE_LABELS, TONE_LABELS, ENDING_LABELS, VILLAIN_LAYER_LABELS } from './types'
import { episodeHasScript } from './model'

function pad(number: number): string {
  return String(number).padStart(2, '0')
}

function sceneToFountain(scene: Scene): string {
  const heading = scene.heading.trim() || '场景'
  const mapped = heading
    .replace(/内/g, 'INT.')
    .replace(/外/g, 'EXT.')
    .replace(/日/g, 'DAY')
    .replace(/夜/g, 'NIGHT')

  const lines: string[] = [mapped, '']
  if (scene.action.trim()) {
    lines.push(scene.action.trim(), '')
  }
  for (const dialogue of scene.dialogues) {
    if (!dialogue.character.trim() && !dialogue.line.trim()) continue
    lines.push(dialogue.character.trim() || '角色')
    lines.push(dialogue.line.trim())
    lines.push('')
  }
  return lines.join('\n').trimEnd()
}

function episodeOutline(episode: Episode): string {
  const tags = [
    episode.hookType ? HOOK_LABELS[episode.hookType] : '',
    episode.marker !== 'normal' ? MARKER_LABELS[episode.marker] : '',
  ].filter(Boolean)
  return [
    `第${pad(episode.number)}集  ${episode.title || '未命名'}${tags.length ? `  【${tags.join(' · ')}】` : ''}`,
    episode.hookTitle ? `【集标题钩子】${episode.hookTitle}` : '',
    `开场：${episode.opening || '（空）'}`,
    `中段：${episode.middle || '（空）'}`,
    `钩子：${episode.endingHook || '（空）'}`,
    episode.nextPreview ? `下集：${episode.nextPreview}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function episodeScript(episode: Episode): string {
  const header = [
    `第${pad(episode.number)}集  ${episode.title || '未命名'}`,
    episode.hookTitle ? `【集标题钩子】${episode.hookTitle}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  if (!episodeHasScript(episode)) {
    return `${header}\n（本集尚未写剧本）`
  }

  const body = episode.scenes
    .map((scene) => {
      const dialogues = scene.dialogues
        .filter((line) => line.character.trim() || line.line.trim())
        .map((line) => `${line.character || '角色'}：${line.line}`)
        .join('\n')
      return [scene.heading || '场景', scene.action, dialogues].filter(Boolean).join('\n')
    })
    .join('\n\n')

  const hook = [
    episode.endingHook ? `【本集钩子】${episode.endingHook}` : '',
    episode.nextPreview ? `【下集预告】${episode.nextPreview}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return [header, body, hook].filter(Boolean).join('\n\n')
}

function clipPrompt(clip: H3Clip): string {
  return [
    `镜头${clip.number}  ${clip.heading || '未命名'}  ${clip.duration}s`,
    clip.prompt || '（空提示词）',
  ].join('\n')
}

function episodeClips(episode: Episode): string {
  const header = `第${pad(episode.number)}集  ${episode.title || '未命名'}`
  if (episode.clips.length === 0) {
    return `${header}\n（本集尚未生成 H3 提示词）`
  }
  return [header, ...episode.clips.map(clipPrompt)].join('\n\n')
}

export function exportPlainText(project: Project): string {
  const meta = [
    `《${project.title}》`,
    `类型：${project.genre}　受众：${AUDIENCE_LABELS[project.audience]}　调性：${TONE_LABELS[project.tone]}　结局：${ENDING_LABELS[project.endingType]}　目标集数：${project.targetEpisodes}`,
    `一句话卖点：${project.logline || '（未填写）'}`,
  ].join('\n')

  const story = [
    '===== 故事 =====',
    project.world ? `【这个世界】\n${project.world}` : '【这个世界】（未填写）',
    '',
    project.story || '（尚未写故事正文）',
  ].join('\n')

  const people =
    project.characters.length === 0
      ? '（暂无人物）'
      : project.characters
          .map((person) =>
            [
              `【${ROLE_LABELS[person.role]}】${person.name || '未命名'}`,
              person.villainLayer !== 'none' ? `反派层级：${VILLAIN_LAYER_LABELS[person.villainLayer]}` : '',
              person.tag ? `标签：${person.tag}` : '',
              person.secret ? `秘密：${person.secret}` : '',
              person.relationship ? `关系：${person.relationship}` : '',
              person.notes ? `备注：${person.notes}` : '',
            ]
              .filter(Boolean)
              .join('\n'),
          )
          .join('\n\n')

  const outline =
    project.episodes.length === 0
      ? '（暂无大纲）'
      : project.episodes.map(episodeOutline).join('\n\n')

  const scripts =
    project.episodes.length === 0
      ? '（暂无剧本）'
      : project.episodes.map(episodeScript).join('\n\n----------\n\n')

  const prompts =
    project.episodes.length === 0
      ? '（暂无提示词）'
      : project.episodes.map(episodeClips).join('\n\n----------\n\n')

  return [
    meta,
    story,
    '===== 人物 =====',
    people,
    '===== 分集大纲 =====',
    outline,
    '===== 剧本 =====',
    scripts,
    '===== MiniMax H3 提示词 =====',
    prompts,
    '',
  ].join('\n\n')
}

export function exportH3Prompts(project: Project): string {
  const header = [
    `《${project.title}》 MiniMax H3 提示词`,
    `类型：${project.genre}　调性：${TONE_LABELS[project.tone]}`,
    '',
  ].join('\n')
  const body =
    project.episodes.length === 0
      ? '（暂无提示词）'
      : project.episodes.map(episodeClips).join('\n\n----------\n\n')
  return `${header}\n${body}\n`
}

export function exportFountain(project: Project): string {
  const header = [
    `Title: ${project.title}`,
    'Credit: 短剧剧本',
    'Draft date: TvScript',
    `Source: ${project.logline}`,
    '',
  ].join('\n')

  const body = project.episodes
    .map((episode) => {
      const title = `第${pad(episode.number)}集 ${episode.title || '未命名'}`
      if (!episodeHasScript(episode)) {
        return `${title}\n\n（本集尚未写剧本）`
      }
      const scenes = episode.scenes.map(sceneToFountain).join('\n\n')
      return `${title}\n\n${scenes}`
    })
    .join('\n\n')

  return `${header}\n${body}\n`
}

export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
