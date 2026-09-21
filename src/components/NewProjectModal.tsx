import type { FormEvent } from 'react'
import { useState } from 'react'
import type { Audience, EndingType, Project, Tone } from '../types'
import { AUDIENCE_LABELS, ENDING_LABELS, GENRES, TONE_LABELS } from '../types'
import { AutoTextarea, Field, Modal } from './ui'

const EMPTY_FORM = {
  title: '',
  genre: '霸总逆袭',
  audience: 'female' as Audience,
  tone: 'sweet_hurt' as Tone,
  endingType: 'he' as EndingType,
  targetEpisodes: 80,
  logline: '',
}

export function NewProjectModal({
  onClose,
  onCreate,
  onWorldEnd,
}: {
  onClose: () => void
  onCreate: (partial: Partial<Project>) => void
  onWorldEnd: () => void
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  function submit(event: FormEvent) {
    event.preventDefault()
    onCreate({
      title: form.title.trim() || '未命名短剧',
      genre: form.genre,
      audience: form.audience,
      tone: form.tone,
      endingType: form.endingType,
      targetEpisodes: Math.max(1, Number(form.targetEpisodes) || 80),
      logline: form.logline.trim(),
    })
  }

  return (
    <Modal
      title="新建剧目"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onWorldEnd}>
            载入《世界末日》
          </button>
          <button type="submit" form="new-project-form" className="btn gold">
            创建空白剧目
          </button>
        </>
      }
    >
      <form id="new-project-form" className="stack" onSubmit={submit}>
        <Field label="剧名">
          <input
            autoFocus
            value={form.title}
            placeholder="例如：世界末日"
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
        </Field>
        <div className="grid-2">
          <Field label="类型">
            <select
              value={form.genre}
              onChange={(event) => setForm({ ...form, genre: event.target.value })}
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="受众">
            <select
              value={form.audience}
              onChange={(event) =>
                setForm({ ...form, audience: event.target.value as Audience })
              }
            >
              {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="调性">
            <select
              value={form.tone}
              onChange={(event) => setForm({ ...form, tone: event.target.value as Tone })}
            >
              {Object.entries(TONE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="结局">
            <select
              value={form.endingType}
              onChange={(event) =>
                setForm({ ...form, endingType: event.target.value as EndingType })
              }
            >
              {Object.entries(ENDING_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="目标集数" hint="常见 60–80 集">
          <input
            type="number"
            min={1}
            max={200}
            value={form.targetEpisodes}
            onChange={(event) =>
              setForm({ ...form, targetEpisodes: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="一句话卖点" hint="身份反差 + 核心冲突">
          <AutoTextarea
            rows={3}
            placeholder="末日倒计时开始那天，被悔婚的女人发现：全人类的方舟，只认她的血。"
            value={form.logline}
            onChange={(event) => setForm({ ...form, logline: event.target.value })}
          />
        </Field>
      </form>
    </Modal>
  )
}
