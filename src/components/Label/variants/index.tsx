import styled, { css } from 'styled-components/native'
import { normalize } from '~/utils'

export const Label = styled.Text.attrs({
  hyphenation: 'none',
})<{
  color?: string
  fontSize?: number
  lineHeight?: number
  textAlign?: 'center' | 'justify' | 'right' | 'left'
  isBold?: boolean
  isMedium?: boolean
  isSmall?: boolean
  marginTop?: number
}>`
  font-size: ${({ fontSize }) => normalize(fontSize ? fontSize : 12)}px;
  color: ${({ theme, color }) => (color ? color : theme.COLORS.TEXT)};
  font-family: ${({ theme }) => theme.FONTS.REGULAR};
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'center')};
  ${({ lineHeight }) =>
    lineHeight &&
    css`
      line-height: ${normalize(lineHeight)}px;
    `}

  ${({ isBold }) =>
    isBold &&
    css`
      font-family: ${({ theme }) => theme.FONTS.BOLD};
    `}
    
  ${({ isSmall }) =>
    isSmall &&
    css`
      font-family: ${({ theme }) => theme.FONTS.LIGHT};
    `}
  ${({ isMedium }) =>
    isMedium &&
    css`
      font-family: ${({ theme }) => theme.FONTS.MEDIUM};
    `}
  ${({ marginTop }) =>
    marginTop &&
    css`
      margin-top: ${normalize(marginTop)}px;
    `}
`
