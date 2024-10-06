import styled from 'styled-components/native'
import { normalize } from '~/utils'

export const Container = styled.View`
  flex: 1;
  padding: ${normalize(24)}px ${normalize(24)}px 0;
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
