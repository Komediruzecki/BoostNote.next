import React from 'react'
import { Chart } from '../../../cloud/lib/charts'

export const ChartExport = (config: string, isYml = false) => {
  return <Chart config={config} isYml={isYml} />
}
