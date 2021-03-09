import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  Menu,
  protocol,
  session,
} from 'electron'
import path from 'path'
import url from 'url'
import { template } from './menu'
import { dev } from './consts'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
const noteSubWindows: Map<string, BrowserWindow> = new Map()
let mainWindow: BrowserWindow | null = null
const MAC = process.platform === 'darwin'

// single instance lock
const singleInstance = app.requestSingleInstanceLock()

function createMainWindow() {
  const windowOptions: BrowserWindowConstructorOptions = {
    webPreferences: {
      // nativeWindowOpen: true,
      nodeIntegration: true,
      webSecurity: !dev,
      webviewTag: true,
      enableRemoteModule: true,
      contextIsolation: false,
      preload: dev
        ? path.join(app.getAppPath(), '../static/main-preload.js')
        : path.join(app.getAppPath(), './compiled/app/static/main-preload.js'),
    },
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 630,
  }
  if (process.platform === 'darwin') {
    windowOptions.titleBarStyle = 'hidden'
  }
  const window = new BrowserWindow(windowOptions)

  if (dev) {
    window.loadURL(`http://localhost:3000/app`, {
      userAgent: session.defaultSession.getUserAgent() + ` BoostNote`,
    })
  } else {
    window.loadURL(
      url.format({
        pathname: path.join(app.getAppPath(), './compiled/index.html'),
        protocol: 'file',
        slashes: true,
      })
    )
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  if (MAC) {
    window.on('close', (event) => {
      event.preventDefault()
      window.hide()
    })

    app.on('before-quit', () => {
      window.removeAllListeners()
    })
  }

  window.on('closed', () => {
    mainWindow = null
  })

  return window
}

// single instance lock handler
if (!singleInstance) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show()
      mainWindow.focus()
    }

    if (!MAC) {
      let urlWithBoostNoteProtocol
      for (const arg of argv) {
        if (/^boostnote:\/\//.test(arg)) {
          urlWithBoostNoteProtocol = arg
          break
        }
      }
      if (urlWithBoostNoteProtocol != null && mainWindow != null) {
        mainWindow.webContents.send(
          'open-boostnote-url',
          urlWithBoostNoteProtocol
        )
      }
    }
  })
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window eveReactDOMn after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  /* This file protocol registration will be needed from v9.x.x for PDF export feature */
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })
  mainWindow = createMainWindow()
  ipcMain.on('subWindowNote', (data) => {
    const browserOptions = data[0]
    const routeParams = data[1]
    // console.log('Sub win', routeParams, browserOptions)
    const noteId = routeParams.noteId
    const storageId = routeParams.storageId

    if (noteSubWindows.has(storageId + noteId)) {
      // focus on that window
      const noteSubWindow = noteSubWindows.get(storageId + noteId)
      if (noteSubWindow) {
        noteSubWindow.focus()
        return
      }
    }

    const windowOptions: BrowserWindowConstructorOptions = {
      webPreferences: {
        nodeIntegration: true,
        webSecurity: !dev,
        webviewTag: true,
        enableRemoteModule: true,
        preload: dev
          ? path.join(app.getAppPath(), '../static/main-preload.js')
          : path.join(
              app.getAppPath(),
              './compiled/app/static/main-preload.js'
            ),
      },
      width: 1200,
      height: 700,
      // minWidth: 960,
      // minHeight: 630,
      title: browserOptions.title,
      show: false,
      // parent: undefined,
      frame: true,
    }
    if (process.platform === 'darwin') {
      windowOptions.titleBarStyle = 'hidden'
    }
    const subWindow = new BrowserWindow(windowOptions)
    // if (!dev) {
    // subWindow.setMenu(Menu.buildFromTemplate([]))
    // }

    if (dev) {
      // console.log('Opening sub window note', noteId, storageId)
      subWindow.loadURL(`http://localhost:3000/app#noteApp`)
    } else {
      subWindow.loadURL(
        url.format({
          pathname: path.join(
            app.getAppPath(),
            './compiled/index.html#noteApp'
          ),
          protocol: 'file',
          slashes: true,
        })
      )
    }

    noteSubWindows.set(storageId + noteId, subWindow)
    subWindow.once('ready-to-show', () => {
      subWindow.show()
      subWindow.webContents.send('open-sub-window-note', [noteId, storageId])
    })
    subWindow.on('close', () => {
      // Maybe do something on sub window close
      // if (mainWindow) {
      //   mainWindow.webContents.send('on-sub-window-close', [storageId, noteId])
      // }
      // subWindow.webContents.send('close-sub-window-note', [])
    })
    if (MAC) {
      subWindow.on('close', (event) => {
        // Maybe do something on window hide
        event.preventDefault()
        subWindow.hide()
      })
    }
    subWindow.on('closed', () => {
      noteSubWindows.delete(storageId + noteId)
    })

    ipcMain.on('update-note-from-sub-window', (_event, args) => {
      // who was opened this note - find it, and that window/renderer send the info
      // or just send to each one and who sees the note can update it
      // console.log('Got event',  args)
      if (mainWindow) {
        mainWindow.webContents.send('update-note-from-main-window', args)
      }
    })

    ipcMain.on('notify-note-update', (_event, args) => {
      if (args.length !== 3) {
        return
      }
      const storageId = args[0]
      const noteId = args[1]
      const noteSubWindow = noteSubWindows.get(storageId + noteId)
      if (noteSubWindow == null) {
        return
      }
      // Pass to this window to update it's local note
      noteSubWindow.webContents.send('update-note-from-main-window', args)
    })
  })

  app.on('open-url', (_event, url) => {
    mainWindow!.webContents.send('open-boostnote-url', url)
  })
})
