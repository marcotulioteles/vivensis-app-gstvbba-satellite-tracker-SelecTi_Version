import styled from 'styled-components/native'
import FastImage from 'react-native-fast-image';
import { RFValue } from 'react-native-responsive-fontsize';
import { normalize } from '~/utils';

export const Container = styled.View`
  background-color: black;
  padding: ${normalize(18)}px;
`;

export const ImageLogo = styled(FastImage).attrs({
  resizeMode: 'cover'
})`
  width: ${RFValue(80)}px;
  height: ${RFValue(80)}px;
  align-self: center;
  `
