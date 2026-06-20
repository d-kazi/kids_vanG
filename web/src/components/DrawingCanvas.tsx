import { useEffect, useRef, useState } from 'react'
import { CANVAS_SIZE, idealPath, isDrawable, type Point2D, type ShapeTarget, type Stroke } from '../lib/engine'

interface Mapping {
  readonly side: number
  readonly originX: number
  readonly originY: number
}

function mappingFor(width: number, height: number): Mapping {
  const side = Math.min(width, height)
  return {
    side,
    originX: (width - side) / 2,
    originY: (height - side) / 2
  }
}

function toView(m: Mapping, p: Point2D): { x: number; y: number } {
  return {
    x: m.originX + (p.x / CANVAS_SIZE) * m.side,
    y: m.originY + (p.y / CANVAS_SIZE) * m.side
  }
}

function toNormalized(m: Mapping, x: number, y: number): Point2D {
  if (m.side <= 0) return { x: 0, y: 0 }
  return {
    x: ((x - m.originX) / m.side) * CANVAS_SIZE,
    y: ((y - m.originY) / m.side) * CANVAS_SIZE
  }
}

interface ViewPoint { x: number; y: number }

function strokePath(
  ctx: CanvasRenderingContext2D,
  pts: readonly ViewPoint[],
  opts: { color: string; width: number; dashed: boolean }
): void {
  if (pts.length < 2) return
  ctx.save()
  ctx.lineWidth = opts.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = opts.color
  if (opts.dashed) ctx.setLineDash([0.1, opts.width * 2.2])
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.stroke()
  ctx.restore()
}

interface Props {
  readonly target: ShapeTarget
  readonly committedStroke: Stroke | null
  readonly showComparison: boolean
  readonly acceptsInput: boolean
  readonly onStrokeBegan: () => void
  readonly onStrokeCompleted: (stroke: Stroke) => void
}

/**
 * Whiteboard canvas with low-latency Pointer Events. The child's ink is never
 * altered — we only render their raw stroke and (after they finish) overlay the
 * ideal path for honest comparison.
 */
export function DrawingCanvas(props: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const liveRef = useRef<ViewPoint[]>([])
  const drawingRef = useRef(false)

  // Track size + DPR for crisp rendering on any display.
  useEffect(() => {
    const wrap = wrapperRef.current
    if (!wrap) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width, height } = e.contentRect
        const dpr = window.devicePixelRatio || 1
        const canvas = canvasRef.current
        if (canvas) {
          canvas.width = Math.floor(width * dpr)
          canvas.height = Math.floor(height * dpr)
          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`
          const ctx = canvas.getContext('2d')
          if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        setSize({ w: width, h: height })
      }
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // Clear the live ink when the parent commits (or after retry).
  useEffect(() => {
    if (!props.committedStroke) liveRef.current = []
    redraw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.committedStroke, props.target, props.showComparison, size.w, size.h])

  function redraw() {
    const canvas = canvasRef.current
    if (!canvas || size.w === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, size.w, size.h)
    const m = mappingFor(size.w, size.h)

    const guide = idealPath(props.target, 160).map(p => toView(m, p))
    strokePath(ctx, guide, { color: '#dcdcdc', width: 10, dashed: true })

    if (props.committedStroke) {
      const pts = props.committedStroke.points.map(p => toView(m, p))
      strokePath(ctx, pts, { color: '#292b38', width: 9, dashed: false })
    } else if (liveRef.current.length > 1) {
      strokePath(ctx, liveRef.current, { color: '#292b38', width: 9, dashed: false })
    }

    if (props.showComparison) {
      const ideal = idealPath(props.target, 160).map(p => toView(m, p))
      strokePath(ctx, ideal, { color: 'rgba(51,140,242,0.75)', width: 4, dashed: false })
    }
  }

  function localPoint(e: React.PointerEvent<HTMLCanvasElement>): ViewPoint {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!props.acceptsInput) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    liveRef.current = [localPoint(e)]
    props.onStrokeBegan()
    redraw()
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const native = e.nativeEvent
    const rect = e.currentTarget.getBoundingClientRect()
    const coalesced = typeof native.getCoalescedEvents === 'function'
      ? native.getCoalescedEvents()
      : []
    if (coalesced.length > 0) {
      for (const c of coalesced) {
        liveRef.current.push({ x: c.clientX - rect.left, y: c.clientY - rect.top })
      }
    } else {
      liveRef.current.push(localPoint(e))
    }
    redraw()
  }

  function onPointerUp() {
    if (!drawingRef.current) return
    drawingRef.current = false
    const m = mappingFor(size.w, size.h)
    const normalized = liveRef.current.map(p => toNormalized(m, p.x, p.y))
    const stroke: Stroke = { points: normalized }
    if (isDrawable(stroke)) props.onStrokeCompleted(stroke)
  }

  function onPointerCancel() {
    drawingRef.current = false
    liveRef.current = []
    redraw()
  }

  return (
    <div ref={wrapperRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      />
    </div>
  )
}
