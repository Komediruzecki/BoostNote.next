import React from 'react'
import ReactDOM from 'react-dom'
import { filenamify } from '../../lib/string'

interface SubWindowProps {
  onLoad?: (window: Window) => void
  onClose: () => void
  frameTarget?: string
  title?: string
}

function copyStyles(sourceDoc: Document, targetDoc: Document) {
  // Maybe for later - copying fonts
  // if (sourceDoc.fonts) {
  //   console.log('Source doc', sourceDoc.fonts)
  //   Array.from(sourceDoc.fonts).forEach((font) => targetDoc.fonts.add(font))
  // }
  Array.from(sourceDoc.styleSheets).forEach((styleSheet: any) => {
    try {
      if (styleSheet.href) {
        const newLinkEl = sourceDoc.createElement('link')

        newLinkEl.rel = 'stylesheet'
        newLinkEl.href = styleSheet.href
        targetDoc.head.appendChild(newLinkEl)
      } else if (styleSheet.cssRules && styleSheet.cssRules.length > 0) {
        const newStyleEl = sourceDoc.createElement('style')

        Array.from(styleSheet.cssRules).forEach((cssRule: any) => {
          newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText))
        })

        targetDoc.head.appendChild(newStyleEl)
      }
    } catch (e) {
      console.log(e)
    }
  })
}

export class SubWindow extends React.Component<SubWindowProps> {
  nativeWindowObject: Window | null = null
  private containerEl = document.createElement('div')

  componentWillUnmount() {
    if (this.nativeWindowObject) {
      this.nativeWindowObject.close()
    }
  }

  componentDidMount() {
    this.nativeWindowObject = null
    this.nativeWindowObject = window.open(
      '',
      this.props.frameTarget ? this.props.frameTarget : 'SubWindowEditor',
      `noteSubEditor=true,noteTitle=${filenamify(
        this.props.title ? this.props.title.replace(',', '_') : 'Untitled'
      )}`
    )

    if (this.nativeWindowObject !== null) {
      if (this.nativeWindowObject.document.body) {
        // apply css to the new window by calling function at top of file
        copyStyles(document, this.nativeWindowObject.document)
        this.nativeWindowObject.document.body.appendChild(this.containerEl)
        this.nativeWindowObject.name = this.props.frameTarget
          ? this.props.frameTarget
          : ''
        if (this.props.onLoad) {
          this.props.onLoad(this.nativeWindowObject)
        }

        this.nativeWindowObject.onbeforeunload = this.props.onClose
        // todo: [komediruzecki-22/01/2021] Resolve focus on replace
        //  also see if we can somehow refactor this and replace the content of this portal
        //  rather than closing portal and opening new!
        // this.nativeWindowObject.focus()
      } else {
        this.nativeWindowObject.document.write(
          '<h1>Something went wrong...</h1>'
        )
      }
    }
  }
  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.containerEl,
      this.props.frameTarget
    )
  }
}
