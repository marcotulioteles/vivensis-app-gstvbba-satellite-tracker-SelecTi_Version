import { RFValue } from 'react-native-responsive-fontsize'
import styled from 'styled-components/native'
import FastImage from 'react-native-fast-image'

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  padding: ${RFValue(24)}px ${RFValue(24)}px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`

export const Image = styled(FastImage).attrs({})``
