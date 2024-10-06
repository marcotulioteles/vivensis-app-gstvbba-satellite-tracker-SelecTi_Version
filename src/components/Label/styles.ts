import styled from 'styled-components/native';
import {RFValue} from 'react-native-responsive-fontsize';

export const Text = styled.Text`
  font-size: ${RFValue(13)}px;
  font-family: ${({theme}) => theme.FONTS.REGULAR};
  color: ${({theme}) => theme.COLORS.PRIMARY_500};
`;
