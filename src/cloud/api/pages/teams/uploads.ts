import { GeneralAppProps } from '../../../interfaces/api'
import { SerializedFileInfo } from '../../../interfaces/db/storage'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import { callApi } from '../../../lib/client'

export type UploadsListPageResponseBody = GeneralAppProps & {
  files: SerializedFileInfo[]
  sizeInMb: number
}

export async function getUploadsListPageData({
  search,
}: GetInitialPropsParameters) {
  const data = await callApi<UploadsListPageResponseBody>(
    'api/pages/teams/uploads/list',
    {
      search,
    }
  )

  return data
}
