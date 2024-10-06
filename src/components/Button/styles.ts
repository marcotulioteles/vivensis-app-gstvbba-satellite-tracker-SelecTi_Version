import styled, { css } from 'styled-components/native'
import { Dimensions, TouchableOpacity } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'

interface IButtonProps {
  maxWidth?: number
  maxHeight?: number
  color?: string
  border?: string
  hasNoSpace?: boolean
  isOpen?: boolean
}

export const Container = styled(TouchableOpacity)<IButtonProps>`
  border-radius: 8px;
  height: ${RFValue(56)}px;
  background-color: ${({ theme, color }) => (color ? color : theme.COLORS.PRIMARY_400)};
  justify-content: center;
  align-items: center;
  width: 100%;
  ${({ maxWidth }) =>
    maxWidth &&
    css`
      width: ${RFValue(maxWidth)}px;
    `}
  ${({ maxHeight }) =>
    maxHeight &&
    css`
      height: ${RFValue(maxHeight)}px;
    `}
  ${({ border, theme, hasNoSpace }) =>
    !hasNoSpace &&
    border &&
    css`
      border: 2px solid ${border};
    `}
`

export const IconButton = styled.View``

export const TextButton = styled.Text<{ color?: string }>`
  color: ${({ theme, color }) => (color ? color : theme.COLORS.BACKGROUND)};
  font-size: ${RFValue(17)}px;
  font-family: ${({ theme }) => theme.FONTS.SEMI_BOLD};
  text-align: center;
`

export const ContentButton = styled.View`
  flex-direction: row;
`
