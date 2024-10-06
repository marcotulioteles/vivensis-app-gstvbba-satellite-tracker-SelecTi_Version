import styled, { css } from 'styled-components/native'
import { TextInput } from 'react-native'
import Icon from '@expo/vector-icons/MaterialCommunityIcons'
import { normalize } from '~/utils'

type IconProps = { type: 'error' | 'success' }

export const Container = styled.View<{ isMedium?: boolean; isBigger?: boolean }>`
  width: ${({ isMedium }) => (isMedium ? 50 : 100)}%;
  height: ${({ isBigger }) => (isBigger ? 80 : normalize(40))}px;
  border-radius: ${normalize(8)}px;
  padding: 0 ${normalize(12)}px;
  color: ${({ theme }) => theme.COLORS.TEXT};
  font-family: ${({ theme }) => theme.FONTS.REGULAR};
  margin-bottom: ${normalize(10)}px;
  margin-top: ${normalize(6)}px;
  border: 1px solid;
  position: relative;
  justify-content: flex-start;
  align-items: flex-start;
`

export const TextInputStyled = styled(TextInput).attrs(({ theme }) => {
  placeholderTextColor: theme.COLORS.GRAY_04
})<{ isBigger?: boolean }>`
  flex: 1;
  width: 100%;
  height: ${({ isBigger }) => (isBigger ? 80 : normalize(40))}px;
  color: ${({ theme }) => theme.COLORS.TITLE};
  font-size: ${normalize(14)}px;
  font-family: ${({ theme }) => theme.FONTS.REGULAR};
  justify-content: flex-start;
  align-items: flex-start;
`

export const IconStyled = styled(Icon).attrs<IconProps>(({ theme, type }) => ({
  color: type === 'success' ? theme.COLORS.SUCCESS_400 : theme.COLORS.ALERT_650,
}))`
  position: absolute;
  right: ${normalize(6)}px;
  top: ${normalize(30 / 4)}px;
`

export const IconPasswordStyled = styled(Icon).attrs<IconProps>(({ theme, type }) => ({
  color: type === 'success' ? theme.COLORS.SUCCESS_400 : theme.COLORS.GRAY_01,
}))`
  position: absolute;
  right: ${normalize(48)}px;
  top: ${normalize(70 / 4)}px;
`

export const IconStyledRelative = styled(Icon).attrs(({ theme }) => ({
  color: theme.COLORS.GRAY_04,
}))``

export const TouchableOpacityStyled = styled.TouchableOpacity`
  position: absolute;
  right: ${normalize(10)}px;
  top: ${normalize(10)}px;
`

export const MaxLengthText = styled.Text`
  color: ${({ theme }) => theme.COLORS.GRAY_04};
  font-size: ${normalize(10)}px;
  font-family: ${({ theme }) => theme.FONTS.BOLD};
  position: absolute;
  top: 100%;
  right: 5%;
`
