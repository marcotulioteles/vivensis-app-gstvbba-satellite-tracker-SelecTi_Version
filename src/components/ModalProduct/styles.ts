import { RFValue } from 'react-native-responsive-fontsize'
import styled from 'styled-components/native'
import FastImage from 'react-native-fast-image'
import { normalize } from '~/utils'

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  padding: 0 ${RFValue(24)}px ${RFValue(24)}px;
  padding-top: ${normalize(12)}px;
`

export const Content = styled.View`
  flex: 1;
  padding-top: ${normalize(24)}px;
`

export const Image = styled(FastImage).attrs({
  resizeMode: 'cover',
})`
  width: ${RFValue(80)}px;
  height: ${RFValue(80)}px;
`
