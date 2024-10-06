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

export const ContainerInput = styled.View`
  width: 100%;
  height: ${normalize(40)}px;
  border-radius: ${normalize(8)}px;
  color: ${({ theme }) => theme.COLORS.TEXT};
  font-family: ${({ theme }) => theme.FONTS.REGULAR};
  margin-top: ${normalize(6)}px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.COLORS.GRAY_02};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding: 0 ${RFValue(12)}px;
`
