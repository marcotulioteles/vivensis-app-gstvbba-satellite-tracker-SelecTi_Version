import React, { useState } from 'react'
import { TextInputProps } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import theme from '~/theme'

import { Container, TextInputStyled, TouchableOpacityStyled, IconStyledRelative } from './styles'
import ModalOptions from './components/ModalOptions'
import { Label } from '../Label/variants'
import { normalize } from '~/utils'

interface Props extends TextInputProps {
  hasValidation?: boolean
  error?: boolean
  value?: string
  password?: boolean
  noEditable?: boolean
  label?: string
  hasUpAndDown?: boolean
  setState?: React.Dispatch<React.SetStateAction<string>>
  options?: { key: string; name: string }[]
  message: string
  hasFilter?: boolean
}

export const InputButton = ({
  password = false,
  hasValidation,
  error,
  value,
  noEditable,
  label,
  onFocus,
  message,
  hasUpAndDown,
  setState,
  options,
  editable,
  placeholder,
  hasFilter,
  ...rest
}: Props) => {
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <Container
      style={{
        backgroundColor: editable ? theme.COLORS.WHITE : theme.COLORS.GRAY_08,
        borderColor: theme.COLORS.GRAY_03,
      }}
      activeOpacity={editable ? 0.7 : 1}
      onPress={() => {
        if (editable) setModalVisible(true)
      }}
    >
      <TextInputStyled
        style={{
          backgroundColor: editable ? theme.COLORS.WHITE : theme.COLORS.GRAY_08,
        }}
      >
        <Label
          fontSize={14}
          color={theme.COLORS.TITLE}
          textAlign='left'
          isMedium
          style={{ maxWidth: '90%' }}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {value}
        </Label>
      </TextInputStyled>
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
          Campo obrigatório
        </Label>
      ) : null}
      <>
        <Label
          fontSize={14}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
          }}
          color={theme.COLORS.GRAY_04}
        >
          {value ? '' : placeholder ? placeholder : 'Selecione'}
        </Label>
        <TouchableOpacityStyled
          activeOpacity={editable ? 0.7 : 1}
          onPress={() => {
            if (editable) setModalVisible(true)
          }}
        >
          <IconStyledRelative name='chevron-down' size={RFValue(24)} />
        </TouchableOpacityStyled>
      </>
      <ModalOptions
        message={message}
        modalIsVisible={modalVisible}
        onChangeVisible={() => setModalVisible(false)}
        buttonText='Voltar'
        loading={false}
        transparent
        options={options}
        setState={setState}
        hasFilter={hasFilter}
      />
    </Container>
  )
}
