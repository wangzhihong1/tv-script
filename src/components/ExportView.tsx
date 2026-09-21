import { useMemo, useState } from 'react'
import type { Project } from '../types'
import { downloadText, exportFountain, exportH3Prompts, exportPlainText } from '../exportText'

type Format = 'txt' | 'fountain' | 'h3'

export function ExportView({ project }: { project: Project }) {
  const [format, setFormat] = useState<Format>('txt')
  const [copied, setCopied] = useState(false)
  const text = useMemo(() => {
    if (format === 'fountain') return exportFountain(project)
    if (format === 'h3') return exportH3Prompts(project)
    return exportPlainText(project)
  }, [format, project])
  const filename =
    format === 'fountain'
      ? `${project.title || '短剧'}-fountain.fountain`
      : format === 'h3'
        ? `${project.title || '短剧'}-h3.txt`
        : `${project.title || '短剧'}-剧本.txt`

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
          <button
            type="button"
            className={format === 'h3' ? 'chip on' : 'chip'}
            onClick={() => setFormat('h3')}
          >
            H3 提示词
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
