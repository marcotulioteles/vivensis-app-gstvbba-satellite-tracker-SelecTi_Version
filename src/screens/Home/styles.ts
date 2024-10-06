import styled from 'styled-components/native'
import { normalize } from '~/utils'
import Icon from '@expo/vector-icons/MaterialCommunityIcons'
import { Dimensions } from 'react-native'

export const Container = styled.View`
  flex: 1;
  padding: ${normalize(12)}px ${normalize(15)}px 0;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
`

export const NewBeneficitButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.COLORS.GREEN};
  padding: ${normalize(6)}px ${normalize(8)}px;
  border-radius: ${normalize(3)}px;
  max-width: ${normalize(200)}px;
  margin-top: ${normalize(8)}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

export const ImageLocale = styled.Image`
  width: 100%;
  height: 100%;
  height: ${normalize(180)}px;
  border-radius: ${normalize(8)}px;
`

export const IconStyled = styled(Icon)``

export const WrapperButtons = styled.View<{ hasFour?: boolean }>`
  flex-direction: row;
  align-items: flex-start;
  justify-content: ${({ hasFour }) => (hasFour ? 'flex-start' : 'center')};
  width: 100%;
  flex-wrap: wrap;
  width: ${({ hasFour }) =>
    hasFour ? Dimensions.get('window').width : Dimensions.get('window').width - normalize(20)}px;
`

export const SubTitle = styled.Text`
  color: ${({ theme }) => theme.COLORS.NEUTRAL_GRAY};
  text-align: left;
  font-size: ${normalize(12)}px;
  font-family: ${({ theme }) => theme.FONTS.MEDIUM};
`

export const WrapperPendings = styled.View`
  background-color: ${({ theme }) => theme.COLORS.PRIMARY_400};
  width: ${Dimensions.get('window').width}px;
  margin-left: ${normalize(-8)}px;
  padding: ${normalize(24)}px 0 ${normalize(24)}px ${normalize(16)}px;
  margin-top: 24px;
`

export const WrapperCardPending = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.COLORS.SHAPE};
  width: ${normalize(264)}px;
  height: ${normalize(160)}px;
  margin-top: ${normalize(24)}px;
  border-radius: 8px;
  margin-right: 8px;
`

export const WrapperCardPendingHeader = styled.View`
  background-color: ${({ theme }) => theme.COLORS.GRAY_ICE_GRAY};
  height: ${normalize(56)}px;
  width: 100%;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  justify-content: center;
  padding-left: ${normalize(24)}px;
`

export const WrapperCardContent = styled.View`
  background-color: ${({ theme }) => theme.COLORS.SHAPE};
  height: ${normalize(56)}px;
  width: 100%;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  justify-content: center;
  padding-left: ${normalize(24)}px;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  height: ${normalize(160 - 56)}px;
`
