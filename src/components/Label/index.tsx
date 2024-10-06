import React from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { Text } from './styles'

export interface ILabelProps {
  text: string
  style?: StyleProp<TextStyle>
}

export const Label: React.FC<ILabelProps> = ({ text, style }): JSX.Element => {
  return <Text style={style}>{text}</Text>
}
