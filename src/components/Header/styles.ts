import styled from 'styled-components/native'
import FastImage from 'react-native-fast-image';
import { normalize } from '~/utils';
import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex-direction: row;
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding-top: ${normalize(24)}px;
`;

export const ImageLogo = styled(FastImage).attrs({
  resizeMode: 'cover'
})`
  width: ${RFValue(90)}px;
  height: ${RFValue(90)}px;
  align-self: center;
  `
