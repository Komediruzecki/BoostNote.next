import React, { useCallback, useMemo } from 'react'
import { NoteDocEditibleProps, NoteStorage } from '../../lib/db/types'
import StorageLayout from '../atoms/StorageLayout'
import NotePageToolbar from '../organisms/NotePageToolbar'
import NoteDetail from '../organisms/NoteDetail'
import {
  StorageNotesRouteParams,
  StorageTagsRouteParams,
  StorageTrashCanRouteParams,
  useRouteParams,
} from '../../lib/routeParams'
import { useGeneralStatus } from '../../lib/generalStatus'
import { useDb } from '../../lib/db'
import FolderDetail from '../organisms/FolderDetail'
import TagDetail from '../organisms/TagDetail'
import TrashDetail from '../organisms/TrashDetail'
import SearchModal from '../organisms/SearchModal'
import { useSearchModal } from '../../lib/searchModal'
import styled from '../../lib/styled'
import { useRouter } from '../../lib/router'
import { parseNumberStringOrReturnZero } from '../../lib/string'
import NoteContextView from '../organisms/NoteContextView'
import CloudIntroModal from '../organisms/CloudIntroModal'
import { useCloudIntroModal } from '../../lib/cloudIntroModal'
import { openNewSubWindow } from '../../lib/electronOnly'

interface WikiNotePageProps {
  storage: NoteStorage
}

const WikiNotePage = ({ storage }: WikiNotePageProps) => {
  const routeParams = useRouteParams() as
    | StorageNotesRouteParams
    | StorageTrashCanRouteParams
    | StorageTagsRouteParams
  const { hash } = useRouter()
  const { generalStatus } = useGeneralStatus()
  const { showingCloudIntroModal } = useCloudIntroModal()
  const noteViewMode = generalStatus.noteViewMode
  // const [noteUpdated] = useState(true)

  const note = useMemo(() => {
    switch (routeParams.name) {
      case 'storages.notes': {
        if (routeParams.noteId == null) {
          return undefined
        }
        const note = storage.noteMap[routeParams.noteId]
        if (note == null) {
          return undefined
        }
        if (!note.folderPathname.includes(routeParams.folderPathname)) {
          return undefined
        }
        return note
      }
      case 'storages.tags.show': {
        if (routeParams.noteId == null) {
          return undefined
        }
        const note = storage.noteMap[routeParams.noteId]
        if (note == null) {
          return undefined
        }
        if (!note.tags.includes(routeParams.tagName)) {
          return undefined
        }
        return note
      }
      case 'storages.trashCan': {
        if (routeParams.noteId == null) {
          return undefined
        }
        const note = storage.noteMap[routeParams.noteId]
        if (note == null || !note.trashed) {
          return undefined
        }
        return note
      }
    }
    return undefined
  }, [routeParams, storage.noteMap])

  const { updateNote, addAttachments } = useDb()

  const { showSearchModal } = useSearchModal()

  const getCurrentPositionFromRoute = useCallback(() => {
    let focusLine = 0
    let focusColumn = 0
    if (hash.startsWith('#L')) {
      const focusData = hash.substring(2).split(',')
      if (focusData.length == 2) {
        focusLine = parseNumberStringOrReturnZero(focusData[0])
        focusColumn = parseNumberStringOrReturnZero(focusData[1])
      } else if (focusData.length == 1) {
        focusLine = parseNumberStringOrReturnZero(focusData[0])
      }
    }

    return {
      line: focusLine,
      ch: focusColumn,
    }
  }, [hash])

  const updateAndNotifyOtherWindows = useCallback(
    (
      storageId: string,
      noteId: string,
      noteProps: Partial<NoteDocEditibleProps>
    ) => {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.send('notify-note-update', [storageId, noteId, noteProps])
      return updateNote(storageId, noteId, noteProps)
    },
    [updateNote]
  )

  const openInNewWindowHandler = useCallback(() => {
    if (note == null) {
      return
    }

    openNewSubWindow(
      { title: note.title ? note.title : 'Untitled' },
      {
        storageId: storage.id,
        noteId: note._id,
      }
    )
  }, [note, storage.id])

  // useEffect(() => {
  //   addIpcListener('open-note-in-new-window', openInNewWindowHandler)
  //   return () => {
  //     removeIpcListener('open-note-in-new-window', openInNewWindowHandler)
  //   }
  // }, [openInNewWindowHandler])
  // const updateNoteFromSubWindow = useCallback(
  //   (_: any, args: any[]) => {
  //     if (args.length != 3) {
  //       return
  //     }
  //     if (storage == null || note == null) {
  //       return
  //     }
  //     const storageId = args[0]
  //     const noteId = args[1]
  //     // const noteProps = args[2]
  //     // console.log('Updating note to', noteProps, this.state)
  //
  //     if (storageId == storage.id && noteId == note._id) {
  //       setNoteUpdated((prevState) => !prevState)
  //       // note.content = noteProps.content
  //       // this.updateContent(noteProps.content)
  //       // updateNote(storageId, noteId, noteProps)
  //     } else {
  //       console.warn('Updating note outside of this element')
  //       // setNoteUpdated((prevState) => !prevState)
  //       // note.content = note.content + 'Hey'
  //       // updateNote(storageId, noteId, noteProps)
  //     }
  //   },
  //   [note, storage]
  // )
  //
  // useEffect(() => {
  //   addIpcListener('update-note-from-main-window', updateNoteFromSubWindow)
  //   return () => {
  //     removeIpcListener('open-note-in-new-window', updateNoteFromSubWindow)
  //   }
  // }, [updateNoteFromSubWindow])

  // useEffect(() => {
  //   if (note == null) {
  //     return
  //   }
  //   console.log('After wiki page loaded', note._id)
  //   // see if we have updated content
  //   if (noteUpdated) {
  //     console.log('Note is: ', storage.noteMap[note._id])
  //   }
  // }, [note, noteUpdated, storage.noteMap])

  return (
    <StorageLayout storage={storage}>
      {showSearchModal && <SearchModal storage={storage} />}
      <Container>
        <ContentContainer
          className={
            note != null && generalStatus.showingNoteContextMenu ? '' : 'expand'
          }
        >
          <NotePageToolbar
            note={note}
            storage={storage}
            openInNewWindow={openInNewWindowHandler}
          />
          <div className='detail'>
            {note == null ? (
              routeParams.name === 'storages.notes' ? (
                <FolderDetail
                  storage={storage}
                  folderPathname={routeParams.folderPathname}
                />
              ) : routeParams.name === 'storages.tags.show' ? (
                <TagDetail storage={storage} tagName={routeParams.tagName} />
              ) : routeParams.name === 'storages.trashCan' ? (
                <TrashDetail storage={storage} />
              ) : (
                <div>Idle</div>
              )
            ) : (
              <NoteDetail
                // key={noteUpdated + ''}
                note={note}
                storage={storage}
                updateNote={updateAndNotifyOtherWindows}
                addAttachments={addAttachments}
                viewMode={noteViewMode}
                initialCursorPosition={getCurrentPositionFromRoute()}
              />
            )}
          </div>
        </ContentContainer>
        {note != null && generalStatus.showingNoteContextMenu && (
          <NoteContextView storage={storage} note={note} />
        )}
      </Container>
      {showingCloudIntroModal && <CloudIntroModal />}
    </StorageLayout>
  )
}

export default WikiNotePage

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
`

const ContentContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 350px;
  &.expand {
    right: 0;
  }
  display: flex;
  flex-direction: column;
  height: 100%;
  .detail {
    flex: 1;
    overflow: hidden;
  }
`
