import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface IconProps {
  focused?: boolean
}

export const Container = styled.View`
  flex: 1;
  padding: 0 ${RFValue(24)}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-height: ${RFValue(80)}px;
`;

export const IconStyled = styled(MaterialCommunityIcons)<IconProps>`
  margin-top: 10px;
`;
