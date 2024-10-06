import { RFValue } from 'react-native-responsive-fontsize'
import styled from 'styled-components/native'
import FastImage from 'react-native-fast-image'

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.COLORS.BACKGROUND};
  padding: ${RFValue(32)}px ${RFValue(24)}px;
  border-radius: 16px;
`

export const Image = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  width: ${RFValue(80)}px;
  height: ${RFValue(80)}px;
`
