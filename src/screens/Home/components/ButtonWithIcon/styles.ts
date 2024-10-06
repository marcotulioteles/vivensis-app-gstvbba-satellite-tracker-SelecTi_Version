import styled from 'styled-components/native'
import { normalize } from '~/utils'

export const Container = styled.TouchableOpacity<{ marginRightHiden?: boolean }>`
  width: ${normalize(76)}px;
  margin-right: ${({ marginRightHiden }) => (marginRightHiden ? 0 : normalize(8))}px;
`

export const WrapperIcon = styled.View`
  background-color: ${({ theme }) => theme.COLORS.GRAY_ICE_GRAY};
  width: ${normalize(76)}px;
  height: ${normalize(76)}px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.COLORS.GRAY_08};
  align-items: center;
  justify-content: center;
`

export const TextButton = styled.Text`
  color: ${({ theme }) => theme.COLORS.PRIMARY_400};
  max-width: ${normalize(76)}px;
  flex-wrap: wrap;
  text-align: center;
  font-size: ${normalize(12)}px;
  margin-top: ${normalize(16)}px;
  font-family: ${({ theme }) => theme.FONTS.REGULAR};
`
