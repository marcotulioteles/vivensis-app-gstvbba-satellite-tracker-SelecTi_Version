import React from 'react'
import { Modal as ModalNative, View, TouchableOpacity, Dimensions } from 'react-native'
import { useTheme } from 'styled-components'
import FastImage from 'react-native-fast-image'
import { IconStyled } from '~/screens/Home/styles'
import { RFValue } from 'react-native-responsive-fontsize'
import styled from 'styled-components/native'
import { Button } from '../Button'
import { normalize } from '~/utils'

interface IModalImage {
  imageUrl: string
  modalIsVisible: boolean
  onChangeVisible: () => void
  buttonText?: string
}

export default function ModalImage({
  imageUrl,
  modalIsVisible,
  onChangeVisible,
  buttonText = 'Entendi',
}: IModalImage) {
  const theme = useTheme()

  return (
    <ModalNative
      animationType='fade'
      transparent={true}
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
        <Container>
          <TouchableOpacity
            onPress={onChangeVisible}
            style={{
              alignSelf: 'flex-end',
              position: 'absolute',
              top: RFValue(16),
              right: RFValue(16),
              zIndex: 1,
            }}
          >
            <IconStyled size={30} name='close' />
          </TouchableOpacity>
          <Image
            source={{ uri: imageUrl }}
            style={{
              marginTop: normalize(32),
            }}
          />
          <View
            style={{
              marginTop: 'auto',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              text={buttonText}
              onPress={onChangeVisible}
              color={theme.COLORS.WHITE}
              textColor={theme.COLORS.SECONDARY_900}
              border={theme.COLORS.SECONDARY_900}
            />
          </View>
        </Container>
      </View>
    </ModalNative>
  )
}

const Container = styled.View`
  width: 100%;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  padding: ${RFValue(24)}px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  align-items: center;
  justify-content: center;
  height: ${RFValue(520)}px;
`

const Image = styled(FastImage).attrs({
  resizeMode: 'contain',
})`
  width: 100%;
  height: ${RFValue(300)}px;
`
