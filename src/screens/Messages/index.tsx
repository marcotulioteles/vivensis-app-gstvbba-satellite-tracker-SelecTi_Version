import React, { useState } from 'react'

import { useTheme } from 'styled-components'
import messaging from '@react-native-firebase/messaging'

import { ActivityIndicator, FlatList, Platform, TouchableOpacity, View } from 'react-native'
import { Container } from './styles'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants/index'
import { RouteProp, useRoute } from '@react-navigation/native'
import { Line } from '~/components/Containers/styles'
import { IconStyled } from '../Home/styles'
import api from '~/services/api'
import { AxiosRequestConfig } from 'axios'
import { TOKEN } from '@env'
import { RootBottomTabParamList } from '~/routes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ModalInfo from '~/components/ModalInfo'
import ModalImage from '~/components/ModalImage'
import ModalHTML from '~/components/ModalHTML'

export type IMessage = {
  tipo_mensagem: 'TEXTO PLANO' | 'IMAGEM' | 'HTML'
  url_imagem: string
  texto_plano_html: string
  fluxo_segue?: 'N' | 'S'
  id?: number
}

export type IMessagesList = {
  id_mensagem: number
  assunto: string
  data: string
  hora: string
}

type BudgetNewRouteProp = RouteProp<RootBottomTabParamList, 'Messages'>
export const Messages = () => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const route = useRoute<BudgetNewRouteProp>()
  const [messages, setMessages] = useState<IMessagesList[]>(route.params.messages)
  const [message, setMessage] = useState<IMessage>()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalOpenImage, setModalOpenImage] = useState(false)
  const [modalOpenHTML, setModalOpenHTML] = useState(false)
  const [title, setTitle] = useState('')

  function getMonthAbbreviation(dateString: string) {
    const [day, month, year] = dateString.split('/')
    const date = new Date(`${year}-${month}-${day}`)

    const monthAbbreviation = format(date, 'MMM', { locale: ptBR })

    return monthAbbreviation.toUpperCase()
  }

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
      const { data } = await api.get(
        `vxappmsg_hst?id_celular=${tokenDevice}&status=NAO_LIDAS`,
        config
      )
      setMessages(data.mensagens)
    }
  }

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Mensagens' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Mensagens' />
      <Container>
        <View style={{ marginBottom: 24 }}>
          <FlatList
            data={messages}
            keyExtractor={(item) => `${item.id_mensagem}`}
            ListEmptyComponent={() => {
              return (
                <View style={{ marginTop: 24 }}>
                  <Label
                    textAlign='left'
                    fontSize={14}
                    color={theme.COLORS.TEXT}
                    lineHeight={21}
                    isMedium
                  >
                    Você não possui mensagens pendentes
                  </Label>
                </View>
              )
            }}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: theme.COLORS.GRAY_08,
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8,
                  }}
                  onPress={async () => {
                    setLoading(true)
                    const { data } = await api.get(
                      `vxappmsg?id_mensagem=${item.id_mensagem}`,
                      config
                    )
                    setMessage({
                      ...data,
                      id: item.id_mensagem,
                    })
                    setTitle(item.assunto)
                    if (data.tipo_mensagem === 'IMAGEM') {
                      setModalOpenImage(true)
                    } else if (data.tipo_mensagem === 'HTML') {
                      setModalOpenHTML(true)
                    } else {
                      setModalOpen(true)
                    }
                    setLoading(false)
                  }}
                >
                  <Line>
                    <View
                      style={{
                        backgroundColor: theme.COLORS.GRAY_ICE_GRAY,
                        borderRadius: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 50,
                        height: 50,
                        marginRight: 16,
                      }}
                    >
                      <Label
                        textAlign='left'
                        fontSize={14}
                        color={theme.COLORS.PRIMARY_400}
                        lineHeight={21}
                      >
                        {getMonthAbbreviation(item.data)}
                      </Label>
                      <Label
                        textAlign='left'
                        fontSize={17}
                        isMedium
                        color={theme.COLORS.PRIMARY_400}
                        lineHeight={26}
                      >
                        {item.data.split('/')[0]}
                      </Label>
                    </View>
                    <View style={{ width: '72%' }}>
                      <Label
                        textAlign='left'
                        fontSize={16}
                        color={theme.COLORS.PRIMARY_500}
                        lineHeight={25}
                        isMedium
                        numberOfLines={1}
                        ellipsizeMode='tail'
                      >
                        {item.assunto}
                      </Label>
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                      }}
                    >
                      <View>
                        <IconStyled
                          name='arrow-right'
                          color={theme.COLORS.PRIMARY_400}
                          size={normalize(18)}
                        />
                      </View>
                    </View>
                  </Line>
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </Container>
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalOpen}
        title={title}
        onChangeVisible={async () => {
          setModalOpen(false)
          if (message) {
            await api.put(
              `vxappmsg?id_mensagem=${message?.id}&id_celular_interno=${route.params.idIntern}`,
              {},
              config
            )
          }
          getToken()
          setMessage(undefined)
        }}
        message={message?.texto_plano_html ?? ''}
        messageDark
        buttonText='Entendi'
        smaller={message && message.tipo_mensagem === 'TEXTO PLANO'}
        hasButtonCpf={false}
      />
      <ModalImage
        modalIsVisible={modalOpenImage}
        onChangeVisible={async () => {
          setModalOpenImage(false)
          if (message) {
            await api.put(
              `vxappmsg?id_mensagem=${message?.id}&id_celular_interno=${route.params.idIntern}`,
              {},
              config
            )
          }
          getToken()
          setMessage(undefined)
        }}
        imageUrl={message?.url_imagem ?? ''}
      />
      <ModalHTML
        modalIsVisible={modalOpenHTML}
        onChangeVisible={async () => {
          setModalOpenHTML(false)
          if (message) {
            await api.put(
              `vxappmsg?id_mensagem=${message?.id}&id_celular_interno=${route.params.idIntern}`,
              {},
              config
            )
          }
          getToken()
          setMessage(undefined)
        }}
        htmlContent={message?.texto_plano_html ?? ''}
      />
    </View>
  )
}
