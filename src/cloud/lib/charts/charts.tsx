import React, { useRef, useEffect, useState } from 'react'
import _Chart from 'chart.js'
import YAML from 'js-yaml'
import { Node } from 'unist'
import visit from 'unist-util-visit'
import unified from 'unified'
import rehypeParse from 'rehype-parse'

interface ChartProps {
  config: string
  isYml?: boolean
}

_Chart.defaults.global.animation = undefined

export const Chart = ({ config, isYml = false }: ChartProps) => {
  const eleRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<{ destroy: Function }>()
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (eleRef.current == null) return

    if (chartRef.current != null) {
      chartRef.current.destroy()
    }

    try {
      setErr(false)
      const parsed = isYml ? YAML.load(config) : JSON.parse(config)
      chartRef.current = new _Chart(eleRef.current.getContext('2d'), parsed)
    } catch (err) {
      setErr(true)
    }
  }, [config, isYml])

  return (
    <div>
      {err && <div>Parse Error</div>}
      <canvas ref={eleRef} />
    </div>
  )
}

interface RehypeChartProps {
  tagName: string
  isYml?: boolean
}

export function rehypeChart({ tagName, isYml = false }: RehypeChartProps) {
  return async (tree: Node) => {
    const eleRef = window.document.getElementById(
      'chart-export'
    ) as HTMLCanvasElement
    if (eleRef == null) {
      return
    }
    const chartNodes: Node[] = []
    visit(tree, { tagName: tagName }, (node: any) => {
      chartNodes.push(node)
    })
    const parser = unified().use(rehypeParse, { fragment: true })
    await Promise.all(
      chartNodes.map(async (node: any) => {
        node.tagName = 'div'
        const value = node.children[0].value
        try {
          const parsed = isYml ? YAML.load(value) : JSON.parse(value)
          const chartData = new _Chart(eleRef.getContext('2d'), parsed)
          const img = new Image()
          img.src = chartData.canvas.toDataURL()
          node.children = parser.parse(img.outerHTML).children
        } catch (err) {
          node.children = [{ type: 'text', value: err.message }]
        }
      })
    )
  }
}
