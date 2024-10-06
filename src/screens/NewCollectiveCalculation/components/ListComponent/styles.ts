import styled, { css } from 'styled-components/native'
import { TouchableOpacity } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { normalize } from '~/utils'
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
  margin-bottom: ${normalize(16)}px;
  align-items: center;
  width: 100%;
  flex-direction: row;
`
export const TextButton = styled.Text`
  font-size: ${RFValue(12)}px;
  font-family: ${({ theme }) => theme.FONTS.SEMI_BOLD};
  text-align: center;
`
export const TextLabel = styled.Text.attrs({
  ellipsizeMode: 'tail',
  numberOfLines: 1,
})`
  font-size: ${normalize(10)}px;
  font-family: ${({ theme }) => theme.FONTS.REGULAR};
  text-align: left;
  width: 80%;
`
export const NoImage = styled.Text<{ color?: string }>`
  height: ${normalize(34)}px;
  width: ${normalize(34)}px;
  margin-left: 1px;
  margin-right: 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.COLORS.GRAY_ICE_GRAY};
`

export const ContentButton = styled.View`
  flex-direction: row;
  margin-left: auto;
  gap: 12;
`
