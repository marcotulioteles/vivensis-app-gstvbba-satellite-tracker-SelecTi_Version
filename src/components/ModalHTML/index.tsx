import React from 'react'
import { Modal as ModalNative, View, TouchableOpacity } from 'react-native'
import { useTheme } from 'styled-components'
import { IconStyled } from '~/screens/Home/styles'
import { RFValue } from 'react-native-responsive-fontsize'
import styled from 'styled-components/native'
import { WebView } from 'react-native-webview'
import { Button } from '../Button'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants'

interface IModalHTML {
  htmlContent: string
  modalIsVisible: boolean
  onChangeVisible: () => void
  buttonText?: string
  type?: string
}

export default function ModalHTML({
  htmlContent,
  modalIsVisible,
  onChangeVisible,
  buttonText = 'Entendi',
  type,
}: IModalHTML) {
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
          <View
            style={{
              width: '100%',
              height: RFValue(300),
              marginBottom: RFValue(16),
              flex: 1,
              marginTop: normalize(28),
            }}
          >
            {type === 'TEXTO PLANO' ? (
              <Label
                lineHeight={25}
                fontSize={16}
                textAlign={'center'}
                style={{ marginTop: RFValue(16) }}
                color={theme.COLORS.TITLE}
              >
                {htmlContent}
              </Label>
            ) : (
              <WebView
                source={{ html: htmlContent, baseUrl: '' }}
                style={{
                  width: '100%',
                  height: RFValue(300),
                  marginBottom: RFValue(16),
                  flex: 1,
                }}
                originWhitelist={['*']}
              />
            )}
          </View>
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
