import React from 'react'
import { Flowchart } from '../../../cloud/lib/charts'

export const FlowChartExport = (code: string) => {
  return <Flowchart code={code} />
}
