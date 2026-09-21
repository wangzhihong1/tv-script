import { useMemo, useState } from 'react'
import type { Project } from '../types'
import { downloadText, exportFountain, exportPlainText } from '../exportText'

export function ExportView({ project }: { project: Project }) {
  const [format, setFormat] = useState<'txt' | 'fountain'>('txt')
  const [copied, setCopied] = useState(false)
  const text = useMemo(
    () => (format === 'txt' ? exportPlainText(project) : exportFountain(project)),
    [format, project],
  )
  const filename = `${project.title || '短剧'}-${format === 'txt' ? '剧本' : 'fountain'}.${format === 'txt' ? 'txt' : 'fountain'}`

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">导出</p>
          <h1>把能拍的稿子带走</h1>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className={format === 'txt' ? 'chip on' : 'chip'}
            onClick={() => setFormat('txt')}
          >
            纯文本
          </button>
          <button
            type="button"
            className={format === 'fountain' ? 'chip on' : 'chip'}
            onClick={() => setFormat('fountain')}
          >
            Fountain
          </button>
          <button type="button" className="btn ghost" onClick={() => void copy()}>
            {copied ? '已复制' : '复制'}
          </button>
          <button
            type="button"
            className="btn gold"
            onClick={() => downloadText(filename, text)}
          >
            下载 {filename}
          </button>
        </div>
      </header>
      <pre className="export-preview">{text}</pre>
    </div>
  )
}
