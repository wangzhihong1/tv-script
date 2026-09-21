import type { Project } from '../types'
import { AutoTextarea, Field } from './ui'

export function StoryView({
  project,
  onChange,
}: {
  project: Project
  onChange: (project: Project) => void
}) {
  return (
    <div className="page story-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">故事</p>
          <h1>先把整件事讲完</h1>
        </div>
      </header>
      <p className="lead">
        这里写的是故事本身：这个世界怎么运转，从开头到结局发生了什么。写完再去拆人物、大纲、剧本和分镜。
      </p>

      <article className="paper story-paper">
        <Field label="一句话卖点" hint="三秒内能听懂的钩子">
          <AutoTextarea
            className="story-logline"
            rows={2}
            placeholder="末日倒计时开始那天，被悔婚的女人发现：全人类的方舟，只认她的血。"
            value={project.logline}
            onChange={(event) => onChange({ ...project, logline: event.target.value })}
          />
        </Field>
        <Field label="这个世界" hint="规则、末日从哪来、谁能活">
          <AutoTextarea
            className="story-world"
            rows={6}
            placeholder="写清这个世界的运转规则。不要写成说明书目录，要写成能拍的处境。"
            value={project.world}
            onChange={(event) => onChange({ ...project, world: event.target.value })}
          />
        </Field>
        <Field label="故事" hint="从第一场戏写到结局，先讲完再拆集">
          <AutoTextarea
            className="story-body"
            rows={18}
            placeholder="谁要什么，最大的阻碍是什么，中间如何翻盘，最后人怎样活下来。先写成一篇故事，不要一上来就写分集。"
            value={project.story}
            onChange={(event) => onChange({ ...project, story: event.target.value })}
          />
        </Field>
      </article>
    </div>
  )
}
