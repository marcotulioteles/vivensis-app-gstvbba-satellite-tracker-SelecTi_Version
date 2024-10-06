import styled, {css} from 'styled-components/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { normalize } from '~/utils';

interface IconProps {
  marginLeft?: number
  marginRight?: number
}

export const IconMaterialStyled = styled(MaterialCommunityIcons)<IconProps>`
  ${({marginLeft}) => marginLeft && css`
    margin-left: ${normalize(marginLeft)}px;
  `}
  ${({marginRight}) => marginRight && css`
    margin-right: ${normalize(marginRight)}px;
  `}
`;
