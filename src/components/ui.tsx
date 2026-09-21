import {
  useEffect,
  useRef,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint ? <em>{hint}</em> : null}
      </span>
      {children}
    </label>
  )
}

export function AutoTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [props.value])

  return <textarea ref={ref} {...props} />
}

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h3 id="modal-title">{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  )
}

export function EmptyHint({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-hint">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

export function padEp(number: number): string {
  return String(number).padStart(2, '0')
}
