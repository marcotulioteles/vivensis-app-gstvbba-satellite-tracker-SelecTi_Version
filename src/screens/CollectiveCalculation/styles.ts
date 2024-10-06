import { RFValue } from 'react-native-responsive-fontsize';
import styled from 'styled-components/native'
import { normalize } from '~/utils';

export const Container = styled.View`
  flex: 1;
  padding: ${normalize(24)}px ${normalize(24)}px 12px;
  background-color: ${({theme}) => theme.COLORS.WHITE};
`;

export const Text = styled.Text<{isBold: boolean}>`
  font-size: ${RFValue(12)}px;
  font-family: ${({theme}) => theme.FONTS.REGULAR};
  color: ${({theme}) => theme.COLORS.PRIMARY_500};
  font-weight:${({isBold}) => isBold ?  700 : 400} ;
`