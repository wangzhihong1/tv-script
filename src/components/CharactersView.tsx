import type { Character, CharacterRole, Project, VillainLayer } from '../types'
import { ROLE_LABELS, VILLAIN_LAYER_LABELS } from '../types'
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
          text="至少放一个主角、一个反派、一条爱情线。反派要分层：小反派、中反派、大反派、隐藏反派。"
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
                  onChange={(event) => {
                    const role = event.target.value as CharacterRole
                    update(person.id, {
                      role,
                      villainLayer:
                        role === 'antagonist' && person.villainLayer === 'none'
                          ? 'mid'
                          : person.villainLayer,
                    })
                  }}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="反派层级" hint="配角也可以是隐藏反派">
                <select
                  value={person.villainLayer}
                  onChange={(event) =>
                    update(person.id, { villainLayer: event.target.value as VillainLayer })
                  }
                >
                  {Object.entries(VILLAIN_LAYER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="人设标签">
                <input
                  placeholder="被悔婚的灾民媳妇，方舟唯一活体密钥"
                  value={person.tag}
                  onChange={(event) => update(person.id, { tag: event.target.value })}
                />
              </Field>
              <Field label="秘密 / 底牌">
                <AutoTextarea
                  rows={2}
                  placeholder="十年前被注射星核，门和反应堆只认她的血。"
                  value={person.secret}
                  onChange={(event) => update(person.id, { secret: event.target.value })}
                />
              </Field>
              <Field label="与主角关系">
                <input
                  placeholder="订婚宴上当众悔婚的人 / 要猎杀密钥的人"
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
