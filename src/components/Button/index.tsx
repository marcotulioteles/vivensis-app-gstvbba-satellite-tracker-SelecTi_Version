import React from 'react'

import { Container, TextButton, ContentButton, IconButton } from './styles'
import { ActivityIndicator, TouchableOpacityProps, View } from 'react-native'
import { useTheme } from 'styled-components'
import useKeyboardHook from '~/hooks/KeyboardOpen'

interface Props extends TouchableOpacityProps {
  text?: string
  loading?: boolean
  icon?: JSX.Element
  maxWidth?: number
  maxHeight?: number
  isRight?: boolean
  color?: string
  textColor?: string
  border?: string
  hasNoSpace?: boolean
  onPress: any
}

export const Button = ({
  text,
  maxWidth,
  isRight,
  icon: IconButtonProp,
  style,
  maxHeight,
  color,
  loading,
  disabled,
  textColor,
  border,
  onPress,
  hasNoSpace = false,
  ...rest
}: Props) => {
  const theme = useTheme()
  const { isOpen } = useKeyboardHook()
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress()
    }
  }

  return (
    <Container
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      {...rest}
      style={{ opacity: disabled ? 0.25 : 1 }}
      color={color}
      border={border}
      isOpen={isOpen}
      hasNoSpace={hasNoSpace}
      onPress={handlePress}
      activeOpacity={disabled ? 0.25 : 0.6}
    >
      {loading ? (
        <ActivityIndicator color={theme.COLORS.GRAY_05} size='small' />
      ) : (
        <ContentButton>
          {isRight || !IconButtonProp ? null : <IconButton>{IconButtonProp}</IconButton>}
          <TextButton color={textColor}>{text}</TextButton>
          {isRight && IconButtonProp ? <IconButton>{IconButtonProp}</IconButton> : null}
        </ContentButton>
      )}
    </Container>
  )
}
