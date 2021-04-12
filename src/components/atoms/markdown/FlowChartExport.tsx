import React from 'react'
import { Flowchart } from '../../../cloud/lib/charts'

export const FlowChartExport = (code: string) => {
  console.log('Got to flow chart EXPORTT!!')
  return <Flowchart code={code} />
}
