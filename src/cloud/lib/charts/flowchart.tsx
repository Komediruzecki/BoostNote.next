import React, { useRef, useEffect, useState } from 'react'
import FlowChart from 'flowchart.js'
import { Node } from 'unist'
import visit from 'unist-util-visit'
import unified from 'unified'
import rehypeParse from 'rehype-parse'

export interface FlowchartProps {
  code: string
  options?: any
}

export const Flowchart = ({ code, options }: FlowchartProps) => {
  const eleRef = useRef<HTMLDivElement>(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (eleRef.current == null) {
      return
    }

    try {
      const diagram = FlowChart.parse(code)
      while (eleRef.current.firstChild != null) {
        eleRef.current.removeChild(eleRef.current.lastChild!)
      }
      diagram.drawSVG(eleRef.current, options)
      const svg = eleRef.current.childNodes[0] as SVGElement
      if (svg != null && typeof svg.getAttribute('height') === 'string') {
        eleRef.current.style.setProperty(
          'height',
          `${svg.getAttribute('height')!}px`
        )
      }
      setErr(false)
    } catch (err) {
      setErr(true)
    }
  }, [code, options])

  if (err) {
    return <div>Flowchart parse error</div>
  }

  return <div ref={eleRef} />
}

export function rehypeFlowChart() {
  return async (tree: Node) => {
    const flowchartNodes: Node[] = []
    visit(tree, { tagName: 'flowchart' }, (node: any) => {
      flowchartNodes.push(node)
    })
    const eleRef = window.document.getElementById('flowchart-export')
    if (eleRef == null) {
      return
    }
    const parser = unified().use(rehypeParse, { fragment: true })
    await Promise.all(
      flowchartNodes.map(async (node: any) => {
        // node.tagName = 'div'
        const value = node.children[0].value
        try {
          const diagram = FlowChart.parse(value)
          while (eleRef.firstChild != null) {
            eleRef.removeChild(eleRef.lastChild!)
          }

          diagram.drawSVG(eleRef, { maxWidth: 3 })
          const svg = eleRef.childNodes[0] as SVGElement
          if (svg != null && typeof svg.getAttribute('height') === 'string') {
            eleRef.style.setProperty(
              'height',
              `${svg.getAttribute('height')!}px`
            )
            node.properties.style = `height: ${svg.getAttribute('height')!}px`
            node.properties.className = ''
          }
          node.children = parser.parse(svg.outerHTML).children
        } catch (err) {
          node.children = [{ type: 'text', value: err.message }]
        }
      })
    )
  }
}
