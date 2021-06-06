import { NavResource } from '../v2/interfaces/resources'
import { getFolderPathname } from './utils'

export function getResourceId(source: NavResource) {
  return source.result._id
}

export function getResourceParentPathname(source: NavResource) {
  if (source.type == 'doc') {
    return source.result.folderPathname
  } else {
    return getFolderPathname(source.result._id)
  }
}
