import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native'
import { normalize } from '~/utils';

export const Container = styled.View`
  flex: 1;
  padding: ${normalize(24)}px ${normalize(24)}px 0;
  background-color: ${({theme}) => theme.COLORS.WHITE};
`;


export const TextEmpty = styled.Text`
  font-size: ${RFValue(12)}px;
  font-family: ${({theme}) => theme.FONTS.REGULAR};
  color: ${({theme}) => theme.COLORS.TEXT};
  margin-top: ${normalize(24)}px;
`