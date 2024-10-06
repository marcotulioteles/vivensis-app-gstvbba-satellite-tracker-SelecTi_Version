import React, { useCallback, useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from 'styled-components'
import Geolocation from 'react-native-geolocation-service'
import messaging from '@react-native-firebase/messaging'

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { Header } from '~/components/Header'
import {
  Container,
  IconStyled,
  ImageLocale,
  SubTitle,
  WrapperButtons,
  WrapperCardContent,
  WrapperCardPending,
  WrapperCardPendingHeader,
  WrapperPendings,
} from './styles'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { Footer } from '~/components/Footer'
import { Label } from '~/components/Label/variants'
import Carousel from './components/Carroussel'

import NetInfo from '@react-native-community/netinfo'
import { AxiosRequestConfig } from 'axios'
import { TOKEN } from '@env'
import api from '~/services/api'
import { ButtonWithIcon } from './components/ButtonWithIcon'
import {
  BudgetIcon,
  HelpIcon,
  LuckNumbersIcon,
  NewUserIcon,
  OfflineIcon,
  PinIcon,
  ShieldIcon,
  SignalIcon,
  TVIcon,
  CollectiveCalculation,
} from '~/assets/svgs'
import ModalNoConnection from '~/components/ModalNoConnection'
import { format } from 'date-fns'
import AntennaIcon from '~/assets/svgs/AntennaIcon'
import { Line } from '~/components/Containers/styles'
import AntennaLocalIcon from '~/assets/svgs/AntennaLocalIcon'
import ModalInfo from '~/components/ModalInfo'
import { IMessage, IMessagesList } from '../Messages'
import ModalImage from '~/components/ModalImage'
import ModalHTML from '~/components/ModalHTML'
const NoImage = require('~/assets/images/no-image.jpeg')

export interface SubmitData {
  cpf?: string
  state?: string
  city: string
  caid: string
  scua: string
  date?: Date
}

export const Home = () => {
  const theme = useTheme()
  const navigation = useNavigation()
  const [pendingSubmits, setPendingSubmits] = useState<SubmitData[]>([])
  const [message, setMessage] = useState<IMessage>()
  const [modalType, setModalType] = useState<
    'AO_HABILITAR' | 'AO_REFORCO_SINAL' | 'AO_BUSCAR_GARANTIA' | 'AO_HABILITAR_OFFLINE'
  >()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalOpenImage, setModalOpenImage] = useState(false)
  const [modalOpenHTML, setModalOpenHTML] = useState(false)
  const [itemToSend, setItemToSend] = useState<any>(null)
  const [title, setTitle] = useState('')
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }

  const [chevronColor, setChevronColor] = useState({
    left: theme.COLORS.GRAY_08,
    right: theme.COLORS.PRIMARY_500,
  })
  const scrollViewRef = useRef<ScrollView>(null)

  const [images, setImages] = useState<
    {
      img: string
      link?: string
    }[]
  >([])

  const [loading, setLoading] = useState(true)
  const [hasConnection, setHasConnection] = useState(false)
  const [showModalNoConnection, setShowModalNoConnection] = useState(false)
  const [messages, setMessages] = useState<IMessagesList[]>([])
  const [idIntern, setIdIntern] = useState('')
  const [modalIsVisible, setModalIsVisible] = useState(false)
  const [modalImageIsVisible, setModalImageIsVisible] = useState(false)
  const [modalHTMLIsVisible, setModalHTMLIsVisible] = useState(false)
  const [messageLimit, setMessageLimit] = useState(5)

  async function getNetInfoAndImages() {
    try {
      NetInfo.fetch().then(async (state) => {
        setLoading(true)
        setHasConnection(state.isConnected ?? false)
        if (state.isConnected) {
          try {
            const { data } = await api.get('v2/vxappcarrossel', config)
            if (data?.carrossel?.length) {
              const imgs = data?.carrossel.map(
                (it: { imagem_url: string; position: number; url: string }) => {
                  return {
                    img: `${it.imagem_url}`,
                    position: it.position,
                    link: it.url,
                  }
                }
              )
              setImages(imgs)
              await AsyncStorage.setItem('@imageCount', JSON.stringify(imgs?.length || 0))
              let count = 0
              for (const image of imgs) {
                count++
                await AsyncStorage.setItem(`@imagesurl:${count}`, JSON.stringify(image))
              }
              setLoading(false)
            }
          } catch (er: any) {
            if (er.code === 'ECONNABORTED') {
              // Handle the timeout scenario
              setHasConnection(false)
            } else {
              console.log(er)
            }
            setLoading(false)
          }
        } else {
          const count = await AsyncStorage.getItem('@imageCount')
          let images = []
          if (count) {
            for (let i = 1; i <= Number(count); i++) {
              const image = await AsyncStorage.getItem(`@imagesurl:${i}`)
              images.push(JSON.parse(image ?? ''))
            }
            setImages(
              images.map((it: { img: string }) => {
                return {
                  img: it.img,
                }
              })
            )
          }
          setLoading(false)
        }
        setLoading(false)
      })
    } catch (er) {
      console.log(er)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  async function requestLocationPermission() {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse')
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'Este aplicativo precisa acessar sua localização.',
            buttonNeutral: 'Pergunte-me depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        )
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permissão de localização negada')
        }
      } catch (err) {
        console.warn(err)
      }
    }
  }

  async function requestPermission() {
    await messaging().requestPermission()
  }

  useEffect(() => {
    requestLocationPermission()
    requestPermission()
  }, [])

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      getNetInfoAndImages()
    })

    getNetInfoAndImages()

    return () => unsubscribe()
  }, [])

  useFocusEffect(
    useCallback(() => {
      const loadPendingSubmits = async () => {
        try {
          const storedPendingSubmits = await AsyncStorage.getItem('pendingSubmits')

          if (storedPendingSubmits !== null) {
            setPendingSubmits(JSON.parse(storedPendingSubmits))
          }
        } catch (error) {
          console.error('Erro ao carregar dados pendentes:', error)
        }
      }

      loadPendingSubmits()
    }, [])
  )

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const contentWidth = event.nativeEvent.contentSize.width

    let newLeftColor = theme.COLORS.PRIMARY_500
    let newRightColor = theme.COLORS.PRIMARY_500

    if (scrollPosition <= 0) {
      newLeftColor = theme.COLORS.GRAY_08
    }
    if (scrollPosition >= contentWidth - Dimensions.get('window').width) {
      newRightColor = theme.COLORS.GRAY_08
    }

    setChevronColor({ left: newLeftColor, right: newRightColor })
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

  async function openNextMessageModal(messages: IMessagesList[]) {
    if (messages.length === 0) {
      return
    }

    const nextMessage = messages[0]
    setTitle(nextMessage.assunto)

    const { data } = await api.get<IMessage>(
      `vxappmsg?id_mensagem=${nextMessage.id_mensagem}`,
      config
    )
    const detailedMessage = {
      ...nextMessage,
      ...data,
      id: nextMessage.id_mensagem,
    }
    setMessage(detailedMessage)

    if (data.tipo_mensagem === 'IMAGEM') {
      setModalImageIsVisible(true)
    } else if (data.tipo_mensagem === 'HTML') {
      setModalHTMLIsVisible(true)
    } else {
      setModalIsVisible(true)
    }
  }

  async function getToken() {
    if (await requestUserPermission()) {
      const tokenDevice = await messaging().getToken()
      const { data } = await api.get(
        `vxappmsg_hst?id_celular=${tokenDevice}&status=NAO_LIDAS`,
        config
      )
      setIdIntern(data.id_celular_interno)
      const limitedMessages = data.mensagens.slice(0, messageLimit)
      setMessages(limitedMessages)
      if (limitedMessages.length > 0) {
        await openNextMessageModal(limitedMessages)
      }
    }
  }

  async function handleCloseModal() {
    if (message) {
      await api.put(
        `vxappmsg?id_mensagem=${message?.id}&id_celular_interno=${idIntern}`,
        {},
        config
      )
    }

    const remainingMessages = messages.slice(1)
    const messagesProcessed = messageLimit - remainingMessages.length

    setMessages(remainingMessages)
    setModalIsVisible(false)
    setModalImageIsVisible(false)
    setModalHTMLIsVisible(false)

    if (remainingMessages.length > 0 && messagesProcessed < messageLimit) {
      await openNextMessageModal(remainingMessages)
    } else {
      setMessage(undefined)
    }
  }

  useEffect(() => {
    getToken()
  }, [messageLimit])

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <Header />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <ScrollView style={{ flex: 1 }}>
        <Header />
        <Container>
          {/* {!hasConnection ? (
            <Carousel images={images} />
          ) : ( */}
          <>
            {images?.length ? (
              <Carousel images={images} />
            ) : (
              <ImageLocale source={NoImage} resizeMode='contain' />
            )}
          </>
          {/* )} */}
          {/* <ImageLocale source={NoImage} resizeMode='contain' /> */}
          <View
            style={{
              marginTop: normalize(30),
              marginBottom: normalize(32),
            }}
          >
            <Button
              text='Ativar Receptor'
              onPress={async () => {
                if (!hasConnection) {
                  setShowModalNoConnection(true)
                  return
                }
                try {
                  const { data } = await api.get(`vxappmsg_evento?evento=AO_HABILITAR`, config)
                  if (data.MENSAGEM === 'Método não encontrado') {
                    navigation.navigate('Activate')
                    return
                  }
                  setModalType('AO_HABILITAR')
                  if (data) {
                    setMessage({
                      ...data,
                    })
                    if (data.tipo_mensagem === 'IMAGEM') {
                      if (data?.url_imagem) {
                        setModalOpenImage(true)
                      } else if (data.fluxo_segue === 'S') {
                        navigation.navigate('Activate')
                      } else {
                        return
                      }
                    } else if (
                      data.tipo_mensagem === 'HTML' ||
                      data.tipo_mensagem === 'TEXTO PLANO'
                    ) {
                      if (data?.texto_plano_html) {
                        setModalOpenHTML(true)
                      } else if (data.fluxo_segue === 'S') {
                        navigation.navigate('Activate')
                      } else {
                        return
                      }
                    } else {
                      setModalOpen(true)
                    }
                  } else {
                    navigation.navigate('Activate')
                  }
                } catch (er) {
                  navigation.navigate('Activate')
                }
              }}
            />
          </View>
          <WrapperButtons hasFour={!hasConnection}>
            {!hasConnection && (
              <ButtonWithIcon
                icon={<OfflineIcon />}
                onPress={() => {
                  navigation.navigate('ActivateOffline')
                }}
                title='Ativar Offline'
              />
            )}
            <ButtonWithIcon
              icon={<SignalIcon />}
              title='Reforço de Sinal'
              disabled={!hasConnection}
              onPress={async () => {
                if (!hasConnection) return
                try {
                  const { data } = await api.get(`vxappmsg_evento?evento=AO_REFORCO_SINAL`, config)
                  if (data.MENSAGEM === 'Método não encontrado') {
                    navigation.navigate('Signal')
                    return
                  }
                  setModalType('AO_REFORCO_SINAL')
                  if (data) {
                    setMessage({
                      ...data,
                    })
                    if (data.tipo_mensagem === 'IMAGEM') {
                      if (data?.url_imagem) {
                        setModalOpenImage(true)
                      } else if (data.fluxo_segue === 'S') {
                        navigation.navigate('Signal')
                      } else {
                        return
                      }
                    } else if (
                      data.tipo_mensagem === 'HTML' ||
                      data.tipo_mensagem === 'TEXTO PLANO'
                    ) {
                      if (data?.texto_plano_html?.length) {
                        setModalOpenHTML(true)
                      } else if (data.fluxo_segue === 'S') {
                        navigation.navigate('Signal')
                      } else {
                        return
                      }
                    } else {
                      setModalOpen(true)
                    }
                  } else {
                    navigation.navigate('Signal')
                  }
                } catch (er) {
                  navigation.navigate('Signal')
                }
              }}
            />
            <ButtonWithIcon
              icon={<TVIcon />}
              title='Listagem de Canais'
              onPress={() => {
                if (!hasConnection) {
                  setShowModalNoConnection(true)
                  return
                }
                navigation.navigate('WebViewScreen')
              }}
              disabled={!hasConnection}
            />
            <ButtonWithIcon
              icon={<ShieldIcon />}
              title='Garantia'
              marginRightHiden
              disabled={!hasConnection}
              onPress={async () => {
                // navigation.navigate('Guarantee')
                if (!hasConnection) return
                try {
                  const { data } = await api.get(
                    `vxappmsg_evento?evento=AO_BUSCAR_GARANTIA`,
                    config
                  )
                  if (data.MENSAGEM === 'Método não encontrado') {
                    navigation.navigate('Guarantee')
                    return
                  }
                  setModalType('AO_BUSCAR_GARANTIA')
                  if (data) {
                    setMessage({
                      ...data,
                    })
                    if (data.tipo_mensagem === 'IMAGEM') {
                      if (data?.url_imagem) {
                        setModalOpenImage(true)
                      } else if (data.fluxo_segue === 'S') {
                        navigation.navigate('Guarantee')
                      } else {
                        return
                      }
                    } else if (
                      data.tipo_mensagem === 'HTML' ||
                      data.tipo_mensagem === 'TEXTO PLANO'
                    ) {
                      if (data?.texto_plano_html?.length) {
                        setModalOpenHTML(true)
                      } else if (data.fluxo_segue === 'S') {
                        navigation.navigate('Guarantee')
                      } else {
                        return
                      }
                    } else {
                      setModalOpen(true)
                    }
                  } else {
                    navigation.navigate('Guarantee')
                  }
                } catch (er) {
                  navigation.navigate('Guarantee')
                }
              }}
            />
          </WrapperButtons>
          {pendingSubmits?.length ? (
            <WrapperPendings>
              <Label
                textAlign='left'
                color={theme.COLORS.SHAPE}
                isMedium
                fontSize={16}
                lineHeight={25}
              >
                Ativações Pendentes
              </Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {pendingSubmits.map((it) => (
                  <WrapperCardPending
                    key={`${it.scua}${it.city}${it.caid}${it?.date ?? new Date()}`}
                    onPress={async () => {
                      if (!hasConnection) {
                        setShowModalNoConnection(true)
                        return
                      }
                      try {
                        const { data } = await api.get(
                          `vxappmsg_evento?evento=AO_HABILITAR`,
                          config
                        )
                        if (data.MENSAGEM === 'Método não encontrado') {
                          navigation.navigate('SendActivate', { item: it })
                          return
                        }
                        setModalType('AO_HABILITAR_OFFLINE')
                        if (data) {
                          setMessage({
                            ...data,
                          })
                          if (data.tipo_mensagem === 'IMAGEM') {
                            if (data?.url_imagem) {
                              setModalOpenImage(true)
                            } else if (data.fluxo_segue === 'S') {
                              navigation.navigate('SendActivate', { item: it })
                            } else {
                              return
                            }
                          } else if (
                            data.tipo_mensagem === 'HTML' ||
                            data.tipo_mensagem === 'TEXTO PLANO'
                          ) {
                            if (data?.texto_plano_html) {
                              setModalOpenHTML(true)
                              setItemToSend(it)
                            } else if (data.fluxo_segue === 'S') {
                              navigation.navigate('SendActivate', { item: it })
                            } else {
                              return
                            }
                          } else {
                            setModalOpen(true)
                          }
                        } else {
                          navigation.navigate('SendActivate', { item: it })
                        }
                      } catch (er) {
                        navigation.navigate('SendActivate', { item: it })
                      }
                    }}
                  >
                    <WrapperCardPendingHeader>
                      <Label
                        textAlign='left'
                        color={theme.COLORS.PRIMARY_400}
                        isMedium
                        fontSize={16}
                        lineHeight={25}
                      >
                        {it?.date
                          ? format(new Date(`${it.date}`), "dd.MM.yy 'às' HH:mm")
                          : format(new Date(), "dd.MM.yy 'às' HH:mm")}
                      </Label>
                    </WrapperCardPendingHeader>
                    <WrapperCardContent>
                      <Label
                        textAlign='left'
                        color={theme.COLORS.DARK_GRAY}
                        isMedium
                        fontSize={16}
                        lineHeight={25}
                      >
                        CAID{'    '}
                        <Label
                          textAlign='left'
                          color={theme.COLORS.TITLE}
                          isMedium
                          fontSize={16}
                          lineHeight={25}
                        >
                          {it.caid}
                        </Label>
                      </Label>
                      <Label
                        textAlign='left'
                        color={theme.COLORS.DARK_GRAY}
                        isMedium
                        fontSize={16}
                        lineHeight={25}
                      >
                        SCUA{'    '}
                        <Label
                          textAlign='left'
                          color={theme.COLORS.TITLE}
                          isMedium
                          fontSize={16}
                          lineHeight={25}
                        >
                          {it.scua}
                        </Label>
                      </Label>
                    </WrapperCardContent>
                  </WrapperCardPending>
                ))}
              </ScrollView>
            </WrapperPendings>
          ) : null}

          <Line isBetween marginTop={40} marginBottom={16}>
            <SubTitle>Simulações e Suporte</SubTitle>
            <Line>
              <IconStyled name='chevron-left' size={24} color={chevronColor?.left} />
              <IconStyled name='chevron-right' size={24} color={chevronColor?.right} />
            </Line>
          </Line>
          <WrapperButtons style={{ paddingBottom: 40 }}>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingRight: 40,
              }}
              ref={scrollViewRef}
              horizontal
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {/* <ButtonWithIcon
                icon={<CollectiveCalculation />}
                title='Cálculo de Coletiva'
                disabled={!hasConnection}
                onPress={async () => {
                  if (!hasConnection) return
                  navigation.navigate('CollectiveCalculation')
                }}
              /> */}
              <ButtonWithIcon
                icon={<AntennaIcon />}
                title='Tamanho da Antena'
                disabled={!hasConnection}
                onPress={async () => {
                  // navigation.navigate('Guarantee')
                  if (!hasConnection) return
                  navigation.navigate('AntennaSize')
                }}
              />
              <ButtonWithIcon
                icon={<BudgetIcon />}
                title='Orçamentos'
                onPress={() => navigation.navigate('Budget')}
              />
              <ButtonWithIcon
                icon={<PinIcon />}
                title='Cidades Favoritas'
                disabled={!hasConnection}
                onPress={async () => {
                  // navigation.navigate('Guarantee')
                  if (!hasConnection) return
                  navigation.navigate('FavoriteCities')
                }}
              />
              <ButtonWithIcon
                icon={<LuckNumbersIcon />}
                title='Números da Sorte'
                disabled={!hasConnection}
                onPress={async () => {
                  navigation.navigate('LuckNumbers')
                }}
              />
              <ButtonWithIcon
                icon={<HelpIcon />}
                title='Suporte'
                disabled={!hasConnection}
                onPress={async () => {
                  // navigation.navigate('Guarantee')
                  if (!hasConnection) return
                  await Linking.openURL(
                    `whatsapp://send?text=Olá, vim através do VXApp&phone=4121413002`
                  )
                }}
              />
              <ButtonWithIcon
                icon={<NewUserIcon />}
                title='Pré-cadastro'
                disabled={!hasConnection}
                onPress={async () => {
                  if (hasConnection) {
                    navigation.navigate('RegisterTechnician', {
                      document: '',
                    })
                  }
                }}
              />
              <ButtonWithIcon
                icon={<AntennaLocalIcon />}
                marginRightHiden
                title='Localizar Satélite'
                onPress={async () => {
                  navigation.navigate('SearchSatellite')
                }}
              />
            </ScrollView>
          </WrapperButtons>
        </Container>
        <View>
          <TouchableOpacity
            style={{
              paddingTop: normalize(12),
              paddingBottom: normalize(12),
              backgroundColor: theme.COLORS.GRAY_03,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => Linking.openURL('https://www.vivensis.com.br/politica-de-privacidade')}
          >
            <Label isMedium color={theme.COLORS.SECONDARY_900} fontSize={13}>
              Termos, condições e política de privacidade
            </Label>
            <IconStyled
              style={{ marginLeft: 8 }}
              name='arrow-right'
              size={24}
              color={theme.COLORS.SECONDARY_900}
            />
          </TouchableOpacity>
          <Footer />
          <ModalNoConnection
            modalIsVisible={showModalNoConnection}
            transparent
            title='Sem Sinal'
            loading={false}
            onChangeVisible={() => {
              navigation.navigate('ActivateOffline')
              setShowModalNoConnection(false)
            }}
            message='Para seguir com a ativação offline, clique abaixo. Os dados informados ficarão salvos e serão processados quando seu dispositivo encontrar sinal de internet.'
          />
        </View>
      </ScrollView>

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalOpen}
        title={title}
        onChangeVisible={async () => {
          setModalOpen(false)
          if (message) {
            if (message.fluxo_segue === 'S') {
              if (modalType === 'AO_HABILITAR') {
                navigation.navigate('Activate')
              }
              if (modalType === 'AO_REFORCO_SINAL') {
                navigation.navigate('Signal')
              }
              if (modalType === 'AO_BUSCAR_GARANTIA') {
                navigation.navigate('Guarantee')
              }
              if (modalType === 'AO_HABILITAR_OFFLINE') {
                navigation.navigate('SendActivate', { item: itemToSend })
              }
            }
          }
          setModalType(undefined)
          setModalOpen(false)
          setMessage(undefined)
          setItemToSend(undefined)
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
          setModalOpen(false)
          if (message) {
            if (message.fluxo_segue === 'S') {
              if (modalType === 'AO_HABILITAR') {
                navigation.navigate('Activate')
              }
              if (modalType === 'AO_REFORCO_SINAL') {
                navigation.navigate('Signal')
              }
              if (modalType === 'AO_BUSCAR_GARANTIA') {
                navigation.navigate('Guarantee')
              }
              if (modalType === 'AO_HABILITAR_OFFLINE') {
                navigation.navigate('SendActivate', { item: itemToSend })
              }
            }
          }
          setModalOpenImage(false)
          setModalType(undefined)
          setMessage(undefined)
          setItemToSend(undefined)
        }}
        imageUrl={message?.url_imagem ?? ''}
      />
      <ModalHTML
        modalIsVisible={modalOpenHTML}
        onChangeVisible={async () => {
          setModalOpen(false)
          if (message) {
            if (message.fluxo_segue === 'S') {
              if (modalType === 'AO_HABILITAR') {
                navigation.navigate('Activate')
              }
              if (modalType === 'AO_REFORCO_SINAL') {
                navigation.navigate('Signal')
              }
              if (modalType === 'AO_BUSCAR_GARANTIA') {
                navigation.navigate('Guarantee')
              }
              if (modalType === 'AO_HABILITAR_OFFLINE') {
                navigation.navigate('SendActivate', { item: itemToSend })
              }
            }
          }
          setModalOpenHTML(false)
          setModalType(undefined)
          setMessage(undefined)
          setItemToSend(undefined)
        }}
        htmlContent={message?.texto_plano_html ?? ''}
        type={message?.tipo_mensagem ?? ''}
      />

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalIsVisible}
        title={title}
        onChangeVisible={handleCloseModal}
        message={message?.texto_plano_html ?? ''}
        messageDark
        buttonText='Entendi'
        smaller={message && message.tipo_mensagem === 'TEXTO PLANO'}
        hasButtonCpf={false}
      />
      <ModalImage
        modalIsVisible={modalImageIsVisible}
        onChangeVisible={handleCloseModal}
        imageUrl={message?.url_imagem ?? ''}
      />
      <ModalHTML
        modalIsVisible={modalHTMLIsVisible}
        onChangeVisible={handleCloseModal}
        htmlContent={message?.texto_plano_html ?? ''}
        type={message?.tipo_mensagem ?? ''}
      />
    </View>
  )
}
