import { useCallback, useRef } from 'react'
import { NavResource } from '../../interfaces/resources'
import { useToast } from '../../../../shared/lib/stores/toast'
import { FolderDoc, NoteStorage } from '../../../db/types'
import {
  UpdateFolderRequestBody,
  UpdateDocRequestBody,
  useLocalDB,
} from './useLocalDB'
import {
  getFolderName,
  getFolderPathname,
  getParentFolderPathname,
} from '../../../db/utils'
import { DraggedTo, SidebarDragState } from '../../../../shared/lib/dnd'
import { getResourceId, getResourceParentPathname } from '../../../db/patterns'
import { join } from 'path'
import arrayMove from 'array-move'

type PositionType = 'workspace' | 'folder'
export function useLocalDnd() {
  const draggedResource = useRef<NavResource>()
  const { pushApiErrorMessage, pushMessage } = useToast()
  const {
    updateDocApi,
    renameFolderApi,
    updateFolderOrderedIdsApi,
    updateWorkspaceOrderedIdsApi,
  } = useLocalDB()

  const dropInWorkspace = useCallback(
    async (
      workspaceId: string,
      updateFolder: (folder: FolderDoc, body: UpdateFolderRequestBody) => void,
      updateDoc: (docId: string, body: UpdateDocRequestBody) => void
    ) => {
      if (draggedResource.current == null) {
        return
      }

      if (draggedResource.current.result._id === workspaceId) {
        pushMessage({
          title: 'Oops',
          description: 'Resource is already present in this workspace',
        })
        return
      }

      if (draggedResource.current.type === 'folder') {
        const folder = draggedResource.current.result
        updateFolder(folder, {
          workspaceId: workspaceId,
          oldPathname: getFolderPathname(folder._id),
          newPathname: '/' + getFolderName(folder),
        })
      } else if (draggedResource.current.type === 'doc') {
        const doc = draggedResource.current.result
        updateDoc(doc._id, {
          workspaceId: workspaceId,
          docProps: {
            folderPathname: '/',
          },
        })
      }
    },
    [pushMessage]
  )

  const moveInSameFolder = useCallback(
    async (
      workspaceId: string,
      sourceIndex: number,
      targetedIndex: number,
      orderedIds: string[],
      type: PositionType,
      resourceId: string
    ) => {
      console.log('Calling mutate on@', orderedIds)
      arrayMove.mutate([...orderedIds], sourceIndex, targetedIndex)
      if (type == 'workspace') {
        await updateWorkspaceOrderedIdsApi(resourceId, {
          workspaceId: workspaceId,
          orderedIds: orderedIds,
        })
      } else {
        await updateFolderOrderedIdsApi(resourceId, {
          workspaceId: workspaceId,
          orderedIds: orderedIds,
        })
      }
    },
    [updateFolderOrderedIdsApi, updateWorkspaceOrderedIdsApi]
  )

  const dropInDocOrFolder = useCallback(
    async (
      workspace: NoteStorage,
      targetedResource: NavResource,
      targetedPosition: SidebarDragState
    ) => {
      if (draggedResource.current == null || targetedPosition == null) {
        return
      }

      if (
        draggedResource.current.type === targetedResource.type &&
        draggedResource.current.result._id === targetedResource.result._id
      ) {
        return
      }

      console.log(
        'Got moving of:',
        draggedResource,
        targetedPosition,
        targetedResource
      )

      try {
        const originalResourceId = getResourceId(draggedResource.current)
        if (draggedResource.current.type == 'doc') {
          if (targetedResource.type == 'folder') {
            // move doc to target item (folder) at position (before, in, after)
            if (targetedPosition == DraggedTo.insideFolder) {
              await updateDocApi(originalResourceId, {
                workspaceId: workspace.id,
                docProps: {
                  folderPathname: getFolderPathname(
                    targetedResource.result._id
                  ),
                },
              })
            }
          } else {
            // if (targetedPosition == DraggedTo.beforeItem) {
            const targetParentFolder =
              workspace.folderMap[
                getParentFolderPathname(targetedResource.result.folderPathname)
              ]
            const sourceParentFolder =
              workspace.folderMap[
                getResourceParentPathname(draggedResource.current)
              ]
            // note on note (reorder them)
            const originalPath =
              sourceParentFolder != null ? sourceParentFolder.pathname : '/'
            const targetedPath =
              targetParentFolder != null ? targetParentFolder.pathname : '/'
            const isInterfolderMove = targetedPath === originalPath
            const orderedIds: string[] | undefined =
              targetParentFolder != null
                ? targetParentFolder.orderedIds
                : workspace.workspaceOrderedIds || []
            if (orderedIds == null) {
              console.warn(
                'Error during drag and drop, ordered IDs not initialized'
              )
              throw new Error('The drag and drop transfer data is incorrect')
            }

            let sourceOriginalIndex = -1
            let targetOriginalIndex = -1
            let targetedPositionIndex = -1
            if (isInterfolderMove) {
              // check indexes
              sourceOriginalIndex = orderedIds.indexOf(originalResourceId)
              targetOriginalIndex = orderedIds.indexOf(
                targetedResource.result._id
              )
            }

            if (sourceOriginalIndex === -1 || targetOriginalIndex === -1) {
              // do nothing...
            }

            const isMoveAfter = sourceOriginalIndex < targetOriginalIndex

            switch (targetedPosition) {
              case 0:
                throw new Error('The drag and drop transfer data is incorrect')
              case 1:
                // move after
                targetedPositionIndex = isMoveAfter
                  ? targetOriginalIndex
                  : targetOriginalIndex + 1
                break
              case -1:
                // move before
                targetedPosition = isMoveAfter
                  ? targetOriginalIndex - 1
                  : targetOriginalIndex
                break
            }

            /* move onto itself, do nothing */
            if (
              isInterfolderMove &&
              targetedPositionIndex === sourceOriginalIndex
            ) {
              // do nothing
              return
            } else {
              // Update ordered IDs for workspace or folder (based on is in folder or workspace change
              // Update 2 folders if outer folder/workspace move
              // Maybe focus/navigate after update in database
              const updateType =
                targetParentFolder != null ? 'folder' : 'workspace'
              const updateResourceId =
                targetParentFolder != null
                  ? targetParentFolder._id
                  : workspace.id
              await moveInSameFolder(
                workspace.id,
                sourceOriginalIndex,
                targetedPositionIndex,
                orderedIds,
                updateType,
                updateResourceId
              )
            }
          }
        } else {
          // move folder
          if (targetedResource.type == 'folder') {
            // move folder inside target folder
            if (targetedPosition == DraggedTo.insideFolder) {
              const folderResource = draggedResource.current?.result
              const folderOriginalPathname = getFolderPathname(
                folderResource._id
              )
              const targetFolderPathname = getFolderPathname(
                targetedResource.result._id
              )
              const newFolderPathname = join(
                targetFolderPathname,
                getFolderName(folderResource)
              )
              await renameFolderApi(draggedResource.current?.result, {
                workspaceId: workspace.id,
                oldPathname: folderOriginalPathname,
                newPathname: newFolderPathname,
              })
            }
          }
        }
      } catch (error) {
        console.warn('Error while doing drag and drop', error)
        pushApiErrorMessage(error)
      }
    },
    [updateDocApi, moveInSameFolder, renameFolderApi, pushApiErrorMessage]
  )

  return {
    draggedResource,
    dropInWorkspace,
    dropInDocOrFolder,
  }
}
