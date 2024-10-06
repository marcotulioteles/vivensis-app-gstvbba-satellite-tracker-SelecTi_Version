import styled, { css } from 'styled-components/native'
import { normalize } from '~/utils'

export const Line = styled.View<{
  isBetween?: boolean
  isCenter?: boolean
  fullWidth?: boolean
  marginTop?: number
  marginBottom?: number
}>`
  flex-direction: row;
  align-items: center;
  ${({ isBetween }) =>
    isBetween &&
    css`
      justify-content: space-between;
    `}
  ${({ isCenter }) =>
    isCenter &&
    css`
      justify-content: center;
    `}
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
  ${({ marginTop }) =>
    marginTop &&
    css`
      margin-top: ${normalize(marginTop)}px;
    `}
  ${({ marginBottom }) =>
    marginBottom &&
    css`
      margin-bottom: ${normalize(marginBottom)}px;
    `}
`

export const Column = styled.View``
