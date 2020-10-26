import React, { useMemo, useEffect } from 'react'
import {
  Section,
  SectionHeader,
  SectionSecondaryButton,
} from './styled'
import styled from '../../lib/styled'
import { usePreferences } from '../../lib/preferences'
import { useDb } from '../../lib/db'
import { entries, keys } from '../../lib/db/utils'

import { AllDocsMap, NoteDoc, NoteStorage } from '../../lib/db/types'
import { useTranslation } from 'react-i18next'
import { prepareNoteAsMarkdownFile } from '../../lib/exports'
import { join } from 'path'
import {
  writeFile, mkdir,
} from '../../lib/electronOnly'

const ExportContent = styled.div`
  .export-lead {
    margin-bottom: 24px;

    p,
    button {
      display: inline-block;
    }
    button {
      margin-left: 24px;
    }
  }

  .export-title {
    vertical-align: top;
    text-align: center;
  }

  .export-name {
    margin-bottom: 8px;
  }
`

const ExportTab = () => {
  const { storageMap } = useDb()
  const { preferences } = usePreferences()
  const user = preferences['general.accounts'][0]
  const exportAllNotes = (storage: NoteStorage) => {
    let userSelectedDir = "/mnt/udata/Work/Stories/OpenSrc/assets/storage_batch_export"
    const rootDir = join(userSelectedDir, storage.name)
    mkdir(join(rootDir, storage.name))
    storage.db.getAllDocsMap().then(
      (allDocsMap: AllDocsMap) => {
        const { noteMap, folderMap } = allDocsMap
        for (const folderPath of keys(folderMap)) {
            let fullPath = join(rootDir, folderPath)
            /* todo: error handling for invalid paths, but mkidr should handle that and/or should be correct here since
            in storage already! */
            mkdir(fullPath)
              .then(() => {
                console.log("Created Directory: ", fullPath)
              }).catch(err => console.log("Cannot make directory: ", err))
        }

        /**
         * Uses note content to write it directly to disc.
         * @param content the note content to write
         * @param filename the full pathname of the note
         * @param type the type of note
         */
        function visitNoteContent(content: string, filename: string, type: string) {
          writeFile(join(rootDir, filename), content)
            .then(() => {
              console.log("Wrote file at: ", filename)
            })
            .catch(err => { console.log("Cannot export note at path: ", filename, "[ERROR]: ", err) });
        }

        for (const [_, noteDoc] of entries(noteMap)) {
          prepareNoteAsMarkdownFile(noteDoc as NoteDoc, { includeFrontMatter: true }, visitNoteContent)
        }
      }
    )
  }

  const storageEntries = useMemo(() => {
    return entries(storageMap)
  }, [storageMap])

  useEffect(() => {
    if (user != null) {
    }
  }, [user])

  const loggedIn = user != null
  const { t } = useTranslation()

  return (
    <Section>
      <SectionHeader>{t('export.title')}</SectionHeader>
      <ExportContent>
        {!loggedIn && (
          <div className='export-lead'>
            <p>{t('export.message')}</p>
          </div>
        )}
        {storageEntries.map(([, storage]) => (
          <SectionSecondaryButton key={storage.id} onClick={() => exportAllNotes(storage)}>
            {storage.name}
          </SectionSecondaryButton>
        ))}
      </ExportContent>
    </Section>
  )
}

export default ExportTab
