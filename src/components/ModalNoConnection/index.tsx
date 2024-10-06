import React from 'react'
import {
  ActivityIndicator,
  Linking,
  Modal as ModalNative,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { Container } from './styles'
import { useTheme } from 'styled-components'
import { Label } from '~/components/Label/variants'
import { CheckIcon, ErrorIcon, NoConnectionIcon } from '~/assets/svgs'
import { Button } from '../Button'
import { IconStyled } from '~/screens/Home/styles'
import { normalize } from '~/utils'

interface IModalText {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
  message: string
  loading: boolean
  buttonText?: string
  title?: string
}

export default function ModalNoConnection({
  onChangeVisible,
  transparent,
  modalIsVisible,
  message,
  loading,
  buttonText,
  title,
}: IModalText) {
  const theme = useTheme()

  const handleClose = async () => {
    onChangeVisible()
  }

  return (
    <ModalNative
      animationType='fade'
      transparent={transparent}
      visible={modalIsVisible}
      onRequestClose={onChangeVisible}
    >
      <View
        style={{
          backgroundColor: '#0008',
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            height: loading ? 200 : normalize(400),
            borderRadius: 16,
          }}
        >
          <Container>
            {loading ? (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
                <Label
                  isBold
                  lineHeight={19}
                  fontSize={13}
                  textAlign={'center'}
                  style={{ marginTop: 32 }}
                  isMedium
                >
                  Carregando...
                </Label>
              </ScrollView>
            ) : (
              <>
                <TouchableOpacity
                  onPress={onChangeVisible}
                  style={{
                    alignSelf: 'flex-end',
                  }}
                >
                  <IconStyled size={30} name='close' />
                </TouchableOpacity>

                <NoConnectionIcon
                  style={{ alignSelf: 'center', marginTop: 24, marginBottom: 24 }}
                />
                <Label
                  isBold
                  lineHeight={31}
                  fontSize={20}
                  textAlign={'center'}
                  style={{ marginBottom: 16 }}
                  color={theme.COLORS.DARK_GRAY}
                >
                  {title}
                </Label>
                <Label
                  lineHeight={25}
                  fontSize={16}
                  textAlign={'center'}
                  style={{ marginBottom: 32 }}
                  color={theme.COLORS.DARK_GRAY}
                >
                  {message}
                </Label>

                <View style={{ marginTop: 'auto' }}>
                  <Button
                    text={buttonText ? buttonText : 'Ativação Offline'}
                    onPress={onChangeVisible}
                    color={theme.COLORS.WHITE}
                    textColor={theme.COLORS.SECONDARY_900}
                    border={theme.COLORS.SECONDARY_900}
                  />
                </View>
              </>
            )}
          </Container>
        </View>
      </View>
    </ModalNative>
  )
}
