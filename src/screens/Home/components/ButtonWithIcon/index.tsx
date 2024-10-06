import React from 'react'
import { Container, TextButton, WrapperIcon } from './styles'
import { TouchableOpacityProps } from 'react-native'

interface Props extends TouchableOpacityProps {
  icon: React.JSX.Element
  title: string
  marginRightHiden?: boolean
}
export const ButtonWithIcon = ({ icon, title, marginRightHiden, ...rest }: Props) => {
  return (
    <Container marginRightHiden={marginRightHiden} {...rest}>
      <WrapperIcon>{icon}</WrapperIcon>
      <TextButton>{title}</TextButton>
    </Container>
  )
}
