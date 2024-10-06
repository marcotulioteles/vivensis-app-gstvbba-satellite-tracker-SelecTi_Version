import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal as ModalNative,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { Container } from './styles'
import { useTheme } from 'styled-components'
import { Label } from '~/components/Label/variants'
import { AlertIcon, CheckIcon, ErrorIcon } from '~/assets/svgs'
import { Button } from '../Button'
import { IconStyled } from '~/screens/Home/styles'
import { normalize } from '~/utils'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import NetInfo from '@react-native-community/netinfo'

interface IModalText {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
  message: string
  icon?: 'error' | 'success' | 'alert'
  loading: boolean
  buttonText?: string
  secondButtonText?: string
  actionSecond?: () => void
  hasButtonCpf?: boolean
  title?: string
  closeButton?: () => void
  hiddenBorder?: boolean
  document?: string
  actionSend?: () => void
  isActionSend?: boolean
  hasInfoRegulament?: boolean
  messageDark?: boolean
  smaller?: boolean
  textJustfy?: boolean
}

export default function ModalInfo({
  onChangeVisible,
  transparent,
  modalIsVisible,
  message,
  icon,
  loading,
  buttonText,
  secondButtonText,
  actionSecond,
  hasButtonCpf,
  title,
  closeButton,
  hiddenBorder,
  document,
  isActionSend,
  actionSend,
  hasInfoRegulament,
  messageDark = false,
  smaller = false,
  textJustfy,
}: IModalText) {
  const theme = useTheme()
  const [hasConnection, setHasConnection] = useState(false)
  const navigation = useNavigation()
  useFocusEffect(
    useCallback(() => {
      async function getNetInfo() {
        NetInfo.fetch().then((state) => {
          setHasConnection(state.isConnected ?? false)
        })
      }
      getNetInfo()
    }, [])
  )

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
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: loading ? 200 : smaller ? normalize(400) : normalize(520),
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
                  onPress={() => {
                    if (closeButton) {
                      closeButton()
                      return
                    }
                    onChangeVisible()
                  }}
                  style={{
                    alignSelf: 'flex-end',
                  }}
                >
                  <IconStyled size={30} name='close' />
                </TouchableOpacity>
                {icon === 'error' ? (
                  <ErrorIcon style={{ alignSelf: 'center', marginBottom: 24, marginTop: 24 }} />
                ) : null}
                {icon === 'success' ? (
                  <CheckIcon style={{ alignSelf: 'center', marginBottom: 24, marginTop: 24 }} />
                ) : null}
                {icon === 'alert' ? (
                  <AlertIcon style={{ alignSelf: 'center', marginBottom: 24, marginTop: 24 }} />
                ) : null}
                {title && (
                  <Label
                    isBold
                    lineHeight={29}
                    fontSize={20}
                    textAlign={'center'}
                    style={{ marginBottom: textJustfy ? 42 : 16, marginTop: textJustfy ? 16 : 0 }}
                  >
                    {title}
                  </Label>
                )}
                <Label
                  lineHeight={25}
                  fontSize={16}
                  textAlign={'center'}
                  style={{ marginBottom: 32 }}
                  color={messageDark ? theme.COLORS.TITLE : theme.COLORS.DARK_GRAY}
                >
                  {message}
                </Label>
                {secondButtonText ? (
                  <View
                    style={{
                      marginTop: 'auto',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Button
                      text={buttonText ? buttonText : 'Ok'}
                      onPress={onChangeVisible}
                      color={theme.COLORS.WHITE}
                      textColor={theme.COLORS.SECONDARY_900}
                      border={theme.COLORS.SECONDARY_900}
                    />
                    <View style={{ marginTop: 8 }} />
                    <Button
                      text={secondButtonText ? secondButtonText : 'Ok'}
                      onPress={actionSecond}
                      color={theme.COLORS.WHITE}
                      textColor={theme.COLORS.SECONDARY_900}
                    />

                    <View style={{ marginTop: 8 }} />
                    {hasInfoRegulament && (
                      <TouchableOpacity
                        style={{
                          paddingTop: normalize(12),
                          paddingBottom: normalize(12),
                          backgroundColor: theme.COLORS.GRAY_03,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: Dimensions.get('window').width,
                        }}
                        onPress={() => {
                          onChangeVisible()
                          if (Platform.OS === 'ios') {
                            navigation.navigate('LuckNumbersPdf')
                          } else {
                            Linking.openURL('https://sorteiodossonhosvivensis.com.br/#regulamento')
                          }
                        }}
                      >
                        <Label isMedium color={theme.COLORS.SECONDARY_900} fontSize={13}>
                          Termos e Regulamentos da Campanha
                        </Label>
                        <IconStyled
                          style={{ marginLeft: 8 }}
                          name='arrow-right'
                          size={24}
                          color={theme.COLORS.SECONDARY_900}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={{ marginTop: 'auto' }}>
                    {hasButtonCpf && (
                      <View style={{ marginBottom: 12 }}>
                        <Button
                          text={'Cadastrar!'}
                          onPress={onChangeVisible}
                          color={theme.COLORS.WHITE}
                          textColor={theme.COLORS.SECONDARY_900}
                          border={theme.COLORS.SECONDARY_900}
                          onPressIn={() => {
                            if (hasConnection) {
                              navigation.navigate('RegisterTechnician', {
                                document: document ?? '',
                              })
                              return
                            }
                            Linking.openURL('https://sorteiodossonhosvivensis.com.br/')
                          }}
                        />
                      </View>
                    )}
                    <Button
                      text={buttonText ? buttonText : 'Ok'}
                      onPress={() => {
                        if (isActionSend && actionSend) {
                          actionSend()
                          return
                        }
                        onChangeVisible()
                      }}
                      color={theme.COLORS.WHITE}
                      textColor={theme.COLORS.SECONDARY_900}
                      border={hiddenBorder ? undefined : theme.COLORS.SECONDARY_900}
                    />

                    {hasInfoRegulament && (
                      <TouchableOpacity
                        style={{
                          paddingTop: normalize(12),
                          paddingBottom: normalize(12),
                          backgroundColor: theme.COLORS.GRAY_03,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: Dimensions.get('window').width,
                          marginTop: 12,
                          marginLeft: -normalize(24),
                        }}
                        onPress={() => {
                          onChangeVisible()
                          if (Platform.OS === 'ios') {
                            navigation.navigate('LuckNumbersPdf')
                          } else {
                            Linking.openURL('https://sorteiodossonhosvivensis.com.br/#regulamento')
                          }
                        }}
                      >
                        <Label isMedium color={theme.COLORS.SECONDARY_900} fontSize={13}>
                          Termos e Regulamentos da Campanha
                        </Label>
                        <IconStyled
                          style={{ marginLeft: 8 }}
                          name='arrow-right'
                          size={24}
                          color={theme.COLORS.SECONDARY_900}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            )}
          </Container>
        </View>
      </View>
    </ModalNative>
  )
}
