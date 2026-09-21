import type { Episode, Project, Scene } from './types'
import { AUDIENCE_LABELS, ROLE_LABELS } from './types'
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
  return [
    `第${pad(episode.number)}集  ${episode.title || '未命名'}`,
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

export function exportPlainText(project: Project): string {
  const meta = [
    `《${project.title}》`,
    `类型：${project.genre}　受众：${AUDIENCE_LABELS[project.audience]}　目标集数：${project.targetEpisodes}`,
    `一句话卖点：${project.logline || '（未填写）'}`,
  ].join('\n')

  const people =
    project.characters.length === 0
      ? '（暂无人物）'
      : project.characters
          .map((person) =>
            [
              `【${ROLE_LABELS[person.role]}】${person.name || '未命名'}`,
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

  return [
    meta,
    '===== 人物 =====',
    people,
    '===== 分集大纲 =====',
    outline,
    '===== 剧本 =====',
    scripts,
    '',
  ].join('\n\n')
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
