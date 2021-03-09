import React, { useMemo, useCallback } from 'react'
import NoteDetail from '../organisms/NoteDetail'
import { useRouter } from '../../lib/router'
import {
  useRouteParams,
  StorageNotesInSubWindowParams,
} from '../../lib/routeParams'
import { useDb } from '../../lib/db'
import { NoteDoc, NoteStorage, NoteDocEditibleProps } from '../../lib/db/types'
import { useGeneralStatus } from '../../lib/generalStatus'
import { parseNumberStringOrReturnZero } from '../../lib/string'
import styled from '../../lib/styled/styled'
import NoteContextView from '../organisms/NoteContextView'
import NoteSubWinToolbar from '../organisms/NoteSubWinToolbar'

interface NoteSubWindowPageProps {
  storage: NoteStorage
}

const NoteSubWindowPage = ({ storage }: NoteSubWindowPageProps) => {
  const { updateNote, addAttachments } = useDb()
  const routeParams = useRouteParams() as StorageNotesInSubWindowParams
  const { noteId } = routeParams
  const { hash } = useRouter()
  const { generalStatus } = useGeneralStatus()
  const noteViewMode = generalStatus.noteViewMode

  const updateNoteAndReportToMainWindow = useCallback(
    async (
      storageId: string,
      noteId: string,
      noteProps: Partial<NoteDocEditibleProps>
    ) => {
      // todo: [komediruzecki-08/03/2021] Update code to add electron only API for sending message
      //  see if we need to await on update note?
      await updateNote(storageId, noteId, noteProps)
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.send('update-note-from-sub-window', [
        storageId,
        noteId,
        noteProps,
      ])
    },
    [updateNote]
  )

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

  const currentNote: NoteDoc | undefined = useMemo(() => {
    if (noteId == null) {
      return
    }
    return storage.noteMap[noteId] != null ? storage.noteMap[noteId] : undefined
  }, [noteId, storage.noteMap])

  return (
    <Container>
      <ContentContainer
        className={
          currentNote != null && generalStatus.showingNoteContextMenu
            ? ''
            : 'expand'
        }
      >
        <NoteSubWinToolbar note={currentNote} storage={storage} />
        <div className='detail'>
          {currentNote == null ? (
            <div>Idle</div>
          ) : (
            // <NoteDetailContainer>
            <NoteDetail
              note={currentNote}
              storage={storage}
              updateNote={updateNoteAndReportToMainWindow}
              addAttachments={addAttachments}
              viewMode={noteViewMode}
              initialCursorPosition={getCurrentPositionFromRoute()}
              noteSavePeriod={150}
            />
            // </NoteDetailContainer>
          )}
        </div>
      </ContentContainer>
      {currentNote != null && generalStatus.showingNoteContextMenu && (
        <NoteContextView storage={storage} note={currentNote} />
      )}
    </Container>
  )
}

export default NoteSubWindowPage

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

// const NoteDetailContainer = styled.div`
//   flex: 1px;
//   position: relative;
//   overflow: hidden;
// `

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`
