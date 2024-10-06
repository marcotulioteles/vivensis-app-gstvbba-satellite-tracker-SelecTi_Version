import styled from "styled-components/native";
import Icon from '@expo/vector-icons/MaterialCommunityIcons'

export const IconWhite = styled(Icon).attrs(({ theme }) => 
({ color: theme.COLORS.WHITE }))`
`;

export const IconBlue = styled(Icon).attrs(({ theme }) => 
({ color: theme.COLORS.BLUE_EXTRA_LIGHT }))`
`;

export const IconDark = styled(Icon).attrs(({ theme }) => 
({ color: theme.COLORS.TITLE }))`
`;

