'use client'

import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

export interface StudioRef {
  id: string
  handle: string
  thumbnail: string
  mediaUrls?: string[]
  refType: string | null
  artStyles?: string[]
  extractedPrompt?: string | null
}

export interface SerializedRef {
  num: number
  id: string
  handle: string
  thumbnail: string
  refType: string | null
}

export interface SerializedPrompt {
  promptText: string
  refs: SerializedRef[]
}

export interface PromptEditorHandle {
  loadTemplate: (text: string) => void
  clear: () => void
}

interface MentionState {
  active: boolean
  query: string
  rect: DOMRect | null
}

interface Props {
  references: StudioRef[]
  onSerialize: (result: SerializedPrompt) => void
}

// ── DOM helpers ──────────────────────────────────────────────────────────────

function createChipEl(ref: StudioRef): HTMLSpanElement {
  const chip = document.createElement('span')
  chip.contentEditable = 'false'
  chip.dataset.refId = ref.id
  chip.dataset.handle = ref.handle
  chip.dataset.thumbnail = ref.thumbnail
  chip.dataset.refType = ref.refType ?? ''
  chip.className = [
    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 mx-0.5 align-middle',
    'text-xs font-medium select-none cursor-default',
    'bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-300',
  ].join(' ')

  const img = document.createElement('img')
  img.src = ref.thumbnail
  img.alt = ''
  img.className = 'w-4 h-4 rounded-sm object-cover shrink-0 pointer-events-none'

  const label = document.createElement('span')
  label.textContent = `@${ref.handle}`

  chip.append(img, label)

  if (ref.refType) {
    const type = document.createElement('span')
    type.textContent = `· ${ref.refType.replace(/_/g, '/')}`
    type.className = 'opacity-50'
    chip.append(type)
  }

  return chip
}

function serializeEditor(div: HTMLDivElement): SerializedPrompt {
  const refs: SerializedRef[] = []
  let text = ''

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (el.dataset.refId) {
        const num = refs.length + 1
        refs.push({
          num,
          id: el.dataset.refId,
          handle: el.dataset.handle ?? '',
          thumbnail: el.dataset.thumbnail ?? '',
          refType: el.dataset.refType || null,
        })
        text += `[REF${num}]`
      } else if (el.tagName === 'BR') {
        text += '\n'
      } else if (el.tagName === 'DIV') {
        if (text.length && !text.endsWith('\n')) text += '\n'
        el.childNodes.forEach(walk)
      } else {
        el.childNodes.forEach(walk)
      }
    }
  }

  div.childNodes.forEach(walk)
  return { promptText: text.replace(/\u00A0/g, ' ').trim(), refs }
}

function insertChipIntoRange(range: Range, ref: StudioRef) {
  range.deleteContents()
  const chip = createChipEl(ref)
  range.insertNode(chip)
  // Move caret after chip with a trailing non-breaking space
  const space = document.createTextNode('\u00A0')
  chip.after(space)
  const after = document.createRange()
  after.setStartAfter(space)
  after.collapse(true)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(after)
}

// ── Mention picker ───────────────────────────────────────────────────────────

function MentionPicker({
  items,
  rect,
  activeIndex,
  onSelect,
  onClose,
}: {
  items: StudioRef[]
  rect: DOMRect
  activeIndex: number
  onSelect: (ref: StudioRef) => void
  onClose: () => void
}) {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const picker = document.getElementById('studio-mention-picker')
      if (picker && !picker.contains(e.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [onClose])

  if (!items.length) return null

  return (
    <div
      id="studio-mention-picker"
      style={{ position: 'fixed', top: rect.bottom + 6, left: Math.max(8, rect.left), zIndex: 60 }}
      className="w-72 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden py-1"
    >
      {items.map((ref, i) => (
        <button
          key={ref.id}
          onPointerDown={e => { e.preventDefault(); onSelect(ref) }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
            i === activeIndex
              ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
              : 'text-gray-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <img
            src={ref.thumbnail}
            alt=""
            className="w-9 h-9 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate">@{ref.handle}</div>
            {ref.refType && (
              <div className="text-[11px] opacity-50 truncate">{ref.refType.replace(/_/g, ' ')}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// ── PromptEditor ─────────────────────────────────────────────────────────────

const PromptEditor = forwardRef<PromptEditorHandle, Props>(function PromptEditor(
  { references, onSerialize },
  ref
) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [mention, setMention] = useState<MentionState>({ active: false, query: '', rect: null })
  const [pickerIndex, setPickerIndex] = useState(0)

  const filteredRefs = mention.active
    ? references
        .filter(r =>
          !mention.query ||
          r.handle.toLowerCase().includes(mention.query.toLowerCase()) ||
          (r.extractedPrompt ?? '').toLowerCase().includes(mention.query.toLowerCase())
        )
        .slice(0, 8)
    : []

  const serialize = useCallback(() => {
    if (editorRef.current) onSerialize(serializeEditor(editorRef.current))
  }, [onSerialize])

  const checkEmpty = useCallback(() => {
    const div = editorRef.current
    if (!div) return
    const text = div.innerText.replace(/\u00A0/g, '').trim()
    const hasChip = !!div.querySelector('[data-ref-id]')
    setIsEmpty(!text && !hasChip)
  }, [])

  const detectMention = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) { setMention(m => ({ ...m, active: false })); return }

    const range = sel.getRangeAt(0)
    const container = range.startContainer
    if (container.nodeType !== Node.TEXT_NODE) { setMention(m => ({ ...m, active: false })); return }

    const text = container.textContent ?? ''
    const offset = range.startOffset
    const before = text.slice(0, offset)
    const atIndex = before.lastIndexOf('@')
    if (atIndex === -1) { setMention(m => ({ ...m, active: false })); return }

    const query = before.slice(atIndex + 1)
    if (query.includes(' ') || query.includes('\n')) { setMention(m => ({ ...m, active: false })); return }

    // Position picker below the @ character
    const atRange = document.createRange()
    atRange.setStart(container, atIndex)
    atRange.setEnd(container, atIndex + 1)
    const rect = atRange.getBoundingClientRect()
    setMention({ active: true, query, rect })
    setPickerIndex(0)
  }, [])

  const insertChip = useCallback((ref: StudioRef) => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    const container = range.startContainer
    if (container.nodeType !== Node.TEXT_NODE) return

    const text = container.textContent ?? ''
    const offset = range.startOffset
    const before = text.slice(0, offset)
    const atIndex = before.lastIndexOf('@')
    if (atIndex === -1) return

    const replaceRange = document.createRange()
    replaceRange.setStart(container, atIndex)
    replaceRange.setEnd(container, offset)

    insertChipIntoRange(replaceRange, ref)
    setMention({ active: false, query: '', rect: null })
    setIsEmpty(false)
    serialize()
  }, [serialize])

  const insertChipAtPoint = useCallback((ref: StudioRef, x: number, y: number) => {
    let insertRange: Range | null = null
    if (typeof document.caretRangeFromPoint === 'function') {
      insertRange = document.caretRangeFromPoint(x, y)
    } else {
      // Firefox
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pos = (document as any).caretPositionFromPoint?.(x, y)
      if (pos) {
        insertRange = document.createRange()
        insertRange.setStart(pos.offsetNode, pos.offset)
      }
    }
    if (!insertRange) return

    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(insertRange)

    insertChipIntoRange(insertRange, ref)
    setIsEmpty(false)
    serialize()
  }, [serialize])

  useImperativeHandle(ref, () => ({
    loadTemplate(text: string) {
      const editor = editorRef.current
      if (!editor) return
      editor.innerText = text
      checkEmpty()
      serialize()
      editor.focus()
    },
    clear() {
      const editor = editorRef.current
      if (!editor) return
      editor.innerHTML = ''
      setIsEmpty(true)
      onSerialize({ promptText: '', refs: [] })
    },
  }))

  const handleInput = useCallback(() => {
    checkEmpty()
    detectMention()
    serialize()
  }, [checkEmpty, detectMention, serialize])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!mention.active) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setPickerIndex(i => Math.min(i + 1, filteredRefs.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setPickerIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredRefs[pickerIndex]) insertChip(filteredRefs[pickerIndex])
    } else if (e.key === 'Escape') {
      setMention({ active: false, query: '', rect: null })
    }
  }, [mention.active, filteredRefs, pickerIndex, insertChip])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const refId = e.dataTransfer.getData('text/ref-id')
    const file = e.dataTransfer.files[0]

    let refToInsert: StudioRef | undefined

    if (refId) {
      refToInsert = references.find(r => r.id === refId)
    } else if (file?.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      refToInsert = {
        id: `local-${Date.now()}`,
        handle: file.name.replace(/\.[^.]+$/, '').slice(0, 24),
        thumbnail: url,
        refType: null,
      }
    }

    if (refToInsert) insertChipAtPoint(refToInsert, e.clientX, e.clientY)
  }, [references, insertChipAtPoint])

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Drop zone highlight ring */}
      <div
        className="relative flex-1"
        onDragOver={e => { e.preventDefault(); e.currentTarget.setAttribute('data-drag', 'true') }}
        onDragLeave={e => e.currentTarget.removeAttribute('data-drag')}
        onDrop={handleDrop}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          spellCheck
          className={[
            'min-h-52 w-full rounded-xl p-4 outline-none',
            'text-sm leading-8 text-gray-900 dark:text-white',
            'border border-black/[0.08] dark:border-white/8',
            'bg-white dark:bg-zinc-950',
            'focus:border-violet-400/60 dark:focus:border-violet-500/40 transition-colors',
            'whitespace-pre-wrap break-words',
          ].join(' ')}
        />
        {isEmpty && (
          <div className="absolute top-4 left-4 text-sm leading-8 text-gray-400 dark:text-zinc-600 pointer-events-none select-none">
            {'Write your prompt… type '}
            <span className="font-mono text-xs bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded border border-black/8 dark:border-white/8">@</span>
            {' to reference an image, or drag one in'}
          </div>
        )}
      </div>

      {mention.active && mention.rect && filteredRefs.length > 0 && (
        <MentionPicker
          items={filteredRefs}
          rect={mention.rect}
          activeIndex={pickerIndex}
          onSelect={insertChip}
          onClose={() => setMention({ active: false, query: '', rect: null })}
        />
      )}
    </div>
  )
})

export default PromptEditor
