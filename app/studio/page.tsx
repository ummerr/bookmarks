'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import PromptEditor, {
  type StudioRef,
  type SerializedPrompt,
  type PromptEditorHandle,
} from './PromptEditor'
import ReferenceLibrary from './ReferenceLibrary'

// ── Workflow templates ────────────────────────────────────────────────────────

const WORKFLOWS = [
  {
    id: 'r2v',
    label: 'R2V',
    description: 'Reference → Video',
    template: '[character] [action], [setting], [camera movement], cinematic lighting, [duration]',
    hint: 'Drag a face or subject reference into the prompt for the character slot',
  },
  {
    id: 'v2v',
    label: 'V2V',
    description: 'Video → Video',
    template: 'Restyle [source clip] as [art style], preserve motion and structure, [effect], [color palette]',
    hint: 'Add a style reference to define the output aesthetic',
  },
  {
    id: 'i2v',
    label: 'I2V',
    description: 'Image → Video',
    template: '[image subject] coming to life, [motion description], [camera movement], cinematic',
    hint: 'Use an image reference as the source for animation',
  },
  {
    id: 'r2i',
    label: 'R2I',
    description: 'Reference → Image',
    template: '[subject] in [setting], [art style], [lighting], [composition], [model params]',
    hint: 'Drop a face, style, or subject reference to anchor the output',
  },
  {
    id: 'char',
    label: 'Char Ref',
    description: 'Character Reference',
    template: '[character] as [role/scene], [expression], [outfit], [setting], [art style]',
    hint: 'Use a face_person reference to ground the character identity',
  },
  {
    id: 't2i',
    label: 'T2I',
    description: 'Text → Image',
    template: '[subject], [setting], [art style], [lighting], [camera angle], [model params]',
    hint: 'Pure text-to-image — add style references for consistency',
  },
]

// ── Output panel ─────────────────────────────────────────────────────────────

function OutputPanel({
  serialized,
  onClear,
}: {
  serialized: SerializedPrompt
  onClear: () => void
}) {
  const [copied, setCopied] = useState(false)

  function copyOutput() {
    const { promptText, refs } = serialized
    if (!promptText) return
    let output = promptText
    if (refs.length > 0) {
      output += '\n\n— References —\n'
      refs.forEach(r => {
        output += `[REF${r.num}] @${r.handle}${r.refType ? ` (${r.refType.replace(/_/g, ' ')})` : ''}\n`
      })
    }
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const hasContent = !!serialized.promptText

  return (
    <aside className="w-72 shrink-0 flex flex-col border-l border-black/[0.08] dark:border-white/8 bg-[#f7f6f3] dark:bg-[#0a0a0a]">
      <div className="p-3 border-b border-black/[0.08] dark:border-white/8 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
          Output
        </span>
        <div className="flex items-center gap-1.5">
          {hasContent && (
            <button
              onClick={onClear}
              className="text-[10px] text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors px-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={copyOutput}
            disabled={!hasContent}
            className="rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 px-3 py-1 text-[11px] font-medium text-white transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {/* Prompt text with REF tokens */}
        {hasContent ? (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600 mb-1.5">
              Prompt
            </div>
            <div className="font-mono text-xs text-gray-700 dark:text-zinc-300 leading-5 whitespace-pre-wrap break-words bg-black/[0.03] dark:bg-white/[0.02] rounded-lg p-2.5 border border-black/[0.06] dark:border-white/6">
              {serialized.promptText}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-center text-gray-400 dark:text-zinc-600 max-w-[160px] leading-relaxed">
              Your assembled prompt will appear here as you compose
            </p>
          </div>
        )}

        {/* Reference legend */}
        {serialized.refs.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-600 mb-1.5">
              Reference Legend
            </div>
            <div className="flex flex-col gap-1.5">
              {serialized.refs.map(r => (
                <div
                  key={r.num}
                  className="flex items-center gap-2 rounded-lg border border-black/[0.08] dark:border-white/8 bg-white dark:bg-zinc-950 px-2.5 py-2"
                >
                  <span className="font-mono text-[10px] text-gray-400 dark:text-zinc-600 shrink-0 w-10">
                    REF{r.num}
                  </span>
                  <img src={r.thumbnail} alt="" className="w-7 h-7 rounded-md object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate">
                      @{r.handle}
                    </div>
                    {r.refType && (
                      <div className="text-[10px] text-gray-400 dark:text-zinc-600 truncate">
                        {r.refType.replace(/_/g, ' ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multiple images from same ref */}
        {serialized.refs.length > 0 && (
          <div className="text-[10px] text-gray-400 dark:text-zinc-600 bg-violet-500/5 border border-violet-500/15 rounded-lg p-2.5 leading-relaxed">
            Upload images to your tool in the order shown above when prompted for reference inputs.
          </div>
        )}
      </div>
    </aside>
  )
}

// ── Studio page ───────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [references, setReferences] = useState<StudioRef[]>([])
  const [loading, setLoading] = useState(true)
  const [serialized, setSerialized] = useState<SerializedPrompt>({ promptText: '', refs: [] })
  const [workflow, setWorkflow] = useState('r2v')
  const editorRef = useRef<PromptEditorHandle>(null)

  useEffect(() => {
    fetch('/api/studio/references')
      .then(r => r.json())
      .then(data => {
        setReferences(data.references ?? [])
        setLoading(false)
      })
  }, [])

  function loadTemplate() {
    const wf = WORKFLOWS.find(w => w.id === workflow)
    if (wf) editorRef.current?.loadTemplate(wf.template)
  }

  const handleInsertFromLibrary = useCallback((ref: StudioRef) => {
    // Insert at cursor — delegate to editor if focused, else append
    const editor = document.querySelector<HTMLDivElement>('[contenteditable=true]')
    if (!editor) return
    editor.focus()
    // Simulate a drop at center of editor
    const rect = editor.getBoundingClientRect()
    const sel = window.getSelection()
    // If editor is focused and has a selection, insertChipAtPoint handles it.
    // Fallback: move caret to end and then insert via synthetic drag data
    if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
      const range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
    // Dispatch a synthetic drop on the editor at the current caret position
    const caretRange = sel?.getRangeAt(0)
    const caretRect = caretRange?.getBoundingClientRect()
    const dropX = caretRect && caretRect.width > 0 ? caretRect.left : rect.left + rect.width / 2
    const dropY = caretRect && caretRect.height > 0 ? caretRect.top : rect.top + rect.height / 2

    const dt = new DataTransfer()
    dt.setData('text/ref-id', ref.id)
    editor.dispatchEvent(new DragEvent('drop', {
      bubbles: true,
      clientX: dropX,
      clientY: dropY,
      dataTransfer: dt,
    }))
  }, [])

  const currentWf = WORKFLOWS.find(w => w.id === workflow)

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col bg-[#f7f6f3] dark:bg-[#0a0a0a] overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-black/[0.08] dark:border-white/8 px-4 py-2 flex items-center gap-3 bg-[#f7f6f3]/90 dark:bg-[#0a0a0a]/90">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">Studio</h1>
        <div className="w-px h-4 bg-black/10 dark:bg-white/10" />

        {/* Workflow pills */}
        <div className="flex items-center gap-1">
          {WORKFLOWS.map(w => (
            <button
              key={w.id}
              onClick={() => setWorkflow(w.id)}
              title={w.description}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                workflow === w.id
                  ? 'bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-300'
                  : 'text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white border border-transparent hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* Template button */}
        <button
          onClick={loadTemplate}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-zinc-500 border border-black/[0.08] dark:border-white/8 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={`Load ${currentWf?.description} template`}
        >
          Load template
        </button>

        {/* Hint */}
        {currentWf && (
          <span className="text-[11px] text-gray-400 dark:text-zinc-600 truncate hidden md:block">
            {currentWf.hint}
          </span>
        )}
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: reference library */}
        {loading ? (
          <div className="w-60 shrink-0 border-r border-black/[0.08] dark:border-white/8 flex items-center justify-center">
            <span className="text-xs text-gray-400 dark:text-zinc-600">Loading…</span>
          </div>
        ) : (
          <ReferenceLibrary references={references} onInsert={handleInsertFromLibrary} />
        )}

        {/* Center: compose */}
        <div className="flex-1 overflow-y-auto p-4 flex">
          <PromptEditor
            ref={editorRef}
            references={references}
            onSerialize={setSerialized}
          />
        </div>

        {/* Right: output */}
        <OutputPanel
          serialized={serialized}
          onClear={() => editorRef.current?.clear()}
        />
      </div>
    </div>
  )
}
