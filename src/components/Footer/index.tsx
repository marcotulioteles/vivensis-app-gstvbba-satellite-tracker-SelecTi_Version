import React from 'react'

import { Container } from './styles'
import { useTheme } from 'styled-components'
import { Label } from '../Label/variants'

import { version } from '../../../package.json'

export const Footer = () => {
  const theme = useTheme()
  return (
    <Container>
      <Label isMedium color={theme.COLORS.WHITE} fontSize={14}>
        © 2024 - Vivensis - CNPJ: 07.929.761/0001
      </Label>
      <Label isMedium color={theme.COLORS.WHITE} fontSize={14}>
        Versão: {version}
      </Label>
    </Container>
  )
}
