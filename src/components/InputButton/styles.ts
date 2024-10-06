import styled from 'styled-components/native'
import { View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Icon from '@expo/vector-icons/MaterialCommunityIcons'
import { normalize } from '~/utils'

type IconProps = { type: 'error' | 'success' }

export const Container = styled.TouchableOpacity`
  width: 100%;
  height: ${normalize(40)}px;
  border-radius: ${normalize(8)}px;
  padding: 0 ${normalize(12)}px;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  font-family: ${({ theme }) => theme.FONTS.REGULAR};
  margin-bottom: ${normalize(10)}px;
  margin-top: ${normalize(2)}px;
  border: 1px solid;
  position: relative;
`

export const TextInputStyled = styled(View)`
  flex: 1;
  width: 100%;
  height: ${RFValue(40)}px;
  color: ${({ theme }) => theme.COLORS.TITLE};
  font-family: ${({ theme }) => theme.FONTS.REGULAR};
  padding-top: ${normalize(10)}px;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
`

export const IconStyled = styled(Icon).attrs<IconProps>(({ theme, type }) => ({
  color: type === 'success' ? theme.COLORS.SUCCESS_400 : theme.COLORS.GRAY_01,
}))`
  position: absolute;
  right: ${RFValue(16)}px;
  top: ${normalize(20 / 4)}px;
`

export const IconPasswordStyled = styled(Icon).attrs<IconProps>(({ theme, type }) => ({
  color: type === 'success' ? theme.COLORS.SUCCESS_400 : theme.COLORS.GRAY_01,
}))`
  position: absolute;
  right: ${RFValue(48)}px;
  top: ${normalize(30 / 4)}px;
`

export const IconStyledRelative = styled(Icon).attrs(({ theme }) => ({
  color: theme.COLORS.TITLE,
}))``

export const TouchableOpacityStyled = styled.TouchableOpacity`
  position: absolute;
  right: ${RFValue(6)}px;
  top: ${normalize(25 / 4)}px;
`

export const MaxLengthText = styled.Text`
  color: ${({ theme }) => theme.COLORS.GRAY_04};
  font-size: ${RFValue(10)}px;
  font-family: ${({ theme }) => theme.FONTS.BOLD};
  position: absolute;
  top: 100%;
  right: 5%;
`
