import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HoleDiagramSvg } from './HoleDiagramSvg'

describe('HoleDiagramSvg', () => {
  it('renders an accessible svg hole diagram', () => {
    render(
      <HoleDiagramSvg
        holes={['closed', 'closed', 'closed', 'open', 'open', 'open']}
        label="●●●○○○"
      />,
    )

    expect(screen.getByRole('img', { name: '洞洞图 ●●●○○○' })).toBeInTheDocument()
    expect(screen.getAllByTestId('hole-diagram-dot')).toHaveLength(6)
  })
})
