import type { Character, CharacterRole, Project } from '../types'
import { ROLE_LABELS } from '../types'
import { createCharacter } from '../model'
import { AutoTextarea, EmptyHint, Field } from './ui'

const ROLES: CharacterRole[] = ['protagonist', 'love_interest', 'antagonist', 'supporting']

export function CharactersView({
  project,
  onChange,
}: {
  project: Project
  onChange: (project: Project) => void
}) {
  function update(id: string, patch: Partial<Character>) {
    onChange({
      ...project,
      characters: project.characters.map((person) =>
        person.id === id ? { ...person, ...patch } : person,
      ),
    })
  }

  function remove(id: string) {
    onChange({
      ...project,
      characters: project.characters.filter((person) => person.id !== id),
    })
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">人物卡</p>
          <h1>人要好认、好恨、好嗑</h1>
        </div>
        <button
          type="button"
          className="btn gold"
          onClick={() =>
            onChange({ ...project, characters: [...project.characters, createCharacter()] })
          }
        >
          新增人物
        </button>
      </header>

      {project.characters.length === 0 ? (
        <EmptyHint
          title="还没有人物"
          text="至少放一个主角、一个反派、一条爱情线。每人只需标签、秘密、关系三句话。"
        />
      ) : (
        <div className="card-grid">
          {project.characters.map((person) => (
            <article key={person.id} className={`char-card role-${person.role}`}>
              <div className="char-top">
                <input
                  className="char-name"
                  placeholder="姓名"
                  value={person.name}
                  onChange={(event) => update(person.id, { name: event.target.value })}
                />
                <select
                  value={person.role}
                  onChange={(event) =>
                    update(person.id, { role: event.target.value as CharacterRole })
                  }
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="人设标签">
                <input
                  placeholder="表面是弃妇，实际是失踪继承人"
                  value={person.tag}
                  onChange={(event) => update(person.id, { tag: event.target.value })}
                />
              </Field>
              <Field label="秘密 / 底牌">
                <AutoTextarea
                  rows={2}
                  placeholder="她手里有十年前的监控，和一份真正的亲子鉴定。"
                  value={person.secret}
                  onChange={(event) => update(person.id, { secret: event.target.value })}
                />
              </Field>
              <Field label="与主角关系">
                <input
                  placeholder="当众悔婚的丈夫 / 假闺蜜"
                  value={person.relationship}
                  onChange={(event) => update(person.id, { relationship: event.target.value })}
                />
              </Field>
              <Field label="写作备注">
                <AutoTextarea
                  rows={2}
                  placeholder="每集出场必须推进伤害或反转，不要闲聊。"
                  value={person.notes}
                  onChange={(event) => update(person.id, { notes: event.target.value })}
                />
              </Field>
              <button type="button" className="btn danger-text" onClick={() => remove(person.id)}>
                删除人物
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
