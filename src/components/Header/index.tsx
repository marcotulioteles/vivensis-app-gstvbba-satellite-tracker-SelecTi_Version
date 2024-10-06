import React, { useCallback, useState } from 'react'

import { Container, ImageLogo } from './styles'
import messaging from '@react-native-firebase/messaging'
import { Platform, TouchableOpacity, View } from 'react-native'
import MailIcon from '~/assets/svgs/MailIcon'
import { normalize } from '~/utils'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import api from '~/services/api'
import { IMessagesList } from '~/screens/Messages'
import { AxiosRequestConfig } from 'axios'
import { TOKEN } from '@env'

const Logo = require('~/assets/images/logo.png')

export const Header = () => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }
  const [token, setToken] = useState('')
  const [messages, setMessages] = useState<IMessagesList[]>([])
  const [idIntern, setIdIntern] = useState('')
  const navigation = useNavigation()
  async function requestUserPermission() {
    const authorizationStatus = await messaging().requestPermission()
    if (
      authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      if (Platform.OS === 'ios') {
        await messaging().setAPNSToken('PKU76PT9Y5')
        await messaging().registerDeviceForRemoteMessages()
      }
      return true
    }
    return false
  }

  async function getToken() {
    if (await requestUserPermission()) {
      const tokenDevice = await messaging().getToken()
      setToken(tokenDevice)
      const { data } = await api.get(
        `vxappmsg_hst?id_celular=${tokenDevice}&status=NAO_LIDAS`,
        config
      )
      setIdIntern(data.id_celular_interno)
      setMessages(data.mensagens)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getToken()
    }, [])
  )

  return (
    <Container>
      <ImageLogo source={Logo} />
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: normalize(20),
          right: normalize(20),
          width: normalize(42),
          height: normalize(42),
        }}
        onPress={() => {
          navigation.navigate('Messages', {
            token,
            messages,
            idIntern,
          })
        }}
      >
        <MailIcon style={{ width: normalize(42), height: normalize(42) }} />
        {messages?.length ? (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              position: 'absolute',
              backgroundColor: 'red',
              top: normalize(8),
              right: normalize(6),
              borderWidth: 2,
              borderColor: 'white',
            }}
          />
        ) : null}
      </TouchableOpacity>
    </Container>
  )
}
