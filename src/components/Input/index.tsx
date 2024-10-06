import React, { useState } from 'react'
import { TextInputProps } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import theme from '~/theme'
import { Label } from '../Label/variants'

import {
  Container,
  TextInputStyled,
  IconStyled,
  TouchableOpacityStyled,
  IconStyledRelative,
  IconPasswordStyled,
} from './styles'
import { normalize } from '~/utils'

interface Props extends TextInputProps {
  hasValidation?: boolean
  error?: boolean
  value?: string
  password?: boolean
  noEditable?: boolean
  label?: string
  isMedium?: boolean
  icon?: string
  actionRight?: () => void
  errorText?: string
  iconSize?: number
  isBigger?: boolean
  editable?: boolean
}

export const Input = ({
  password,
  hasValidation,
  error,
  value,
  noEditable,
  label,
  onFocus,
  isMedium = false,
  icon = undefined,
  actionRight,
  errorText,
  iconSize,
  isBigger = false,
  editable = true,
  ...rest
}: Props) => {
  const [showPass, setShowPass] = useState(password ? true : false)
  const [focused, setFocused] = useState(false)

  return (
    <Container
      isMedium={isMedium}
      isBigger={isBigger}
      style={{
        backgroundColor: !noEditable ? theme.COLORS.WHITE : theme.COLORS.GRAY_02,
        borderColor: theme.COLORS.GRAY_02,
      }}
    >
      <TextInputStyled
        {...rest}
        value={value}
        isBigger={isBigger}
        style={{ textAlignVertical: isBigger ? 'top' : undefined }}
        secureTextEntry={showPass ? true : false}
        onFocus={() => {
          setFocused(true)
        }}
        editable={editable}
        placeholderTextColor={theme.COLORS.GRAY_04}
        onBlur={() => {
          setFocused(false)
        }}
        focused={focused || value?.length}
      />

      {hasValidation && error && !password ? (
        <Label
          textAlign='right'
          style={{
            color: 'red',
            position: 'absolute',
            bottom: -normalize(20),
            width: '100%',
            right: 0,
          }}
        >
          {errorText ? errorText : 'Campo obrigatório'}
        </Label>
      ) : null}
      {hasValidation && error && password ? (
        <IconPasswordStyled
          type='error'
          name='close-circle'
          size={RFValue(20)}
          testID='input-error-password'
        />
      ) : null}
      {icon ? (
        <TouchableOpacityStyled onPress={() => (actionRight ? actionRight() : null)}>
          <IconStyledRelative name={icon} size={normalize(iconSize ?? 36)} />
        </TouchableOpacityStyled>
      ) : null}
      {password ? (
        <TouchableOpacityStyled onPress={() => setShowPass(!showPass)}>
          <IconStyledRelative name={showPass ? 'eye' : 'eye-off'} size={RFValue(20)} />
        </TouchableOpacityStyled>
      ) : null}
    </Container>
  )
}
