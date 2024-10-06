import React, { useEffect, useMemo, useState } from 'react'

import { useTheme } from 'styled-components'
import Geolocation from 'react-native-geolocation-service'
import messaging from '@react-native-firebase/messaging'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, Alert, Linking, PermissionsAndroid, Platform, View } from 'react-native'
import { Container } from './styles'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants'

import NetInfo from '@react-native-community/netinfo'
import { Line } from '~/components/Containers/styles'
import axios, { AxiosRequestConfig } from 'axios'
import ModalQrcode from '~/components/ModalQrcode'
import useKeyboardHook from '~/hooks/KeyboardOpen'
import api from '~/services/api'
import { TOKEN } from '@env'
import ModalInfo from '~/components/ModalInfo'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { RootBottomTabParamList } from '~/routes'
import { format } from 'date-fns'
import { SubmitData } from '../Home'
type SendActivateScreenRouteProp = RouteProp<RootBottomTabParamList, 'SendActivate'>
export const SendActivate = () => {
  const theme = useTheme()
  const { isOpen } = useKeyboardHook()

  const navigation = useNavigation()

  const route = useRoute<SendActivateScreenRouteProp>()

  const [textModal, setTextModal] = useState('')
  const [hasValidation, setHasValidation] = useState(false)
  const [hasValidationPost, setHasValidationPost] = useState(false)
  const [modalQrcode, setModalQrcode] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [icon, setIcon] = useState(false)
  const [modalSuccessDelete, setModalSuccessDelete] = useState(false)
  const [hasCpf, setHasCpf] = useState(!!route?.params?.item?.cpf)
  const [data, setData] = useState({
    scua: route.params.item.scua,
    caid: route.params.item.caid,
  })

  const [states, setStates] = useState<
    {
      value: string
      text: string
    }[]
  >([])
  const [cities, setCities] = useState<
    {
      value: string
      text: string
      state: string
    }[]
  >([])
  const [state, setState] = useState('')

  const [loading, setLoading] = useState(true)
  const [hasConnection, setHasConnection] = useState(false)
  const [hasCitieSave, setHasCitieSave] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [modalWithOutCpf, setModalWithOutCpf] = useState(false)
  const [modalDelete, setModalDelete] = useState(false)
  const [isCpfNew, setIsCpfNew] = useState(false)
  const [stepOne, setStepOne] = useState(false)
  const [infoModalVisibleError, setInfoModalVisibleError] = useState(false)
  const [modalVisibleNewCpf, setModalVisibleNewCpf] = useState(false)
  const [geolocation, setGeolocation] = useState({
    lat: '',
    lng: '',
  })

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }

  const [dataForSubmit, setDataForSubmit] = useState<{
    cpf?: string
    state?: string
    city: string
    caid: string
    scua: string
  }>(route.params.item)

  const schema = useMemo(() => {
    return yup.object().shape({
      state: hasCitieSave ? yup.string() : yup.string().required(),
      city: yup.string().required(),
      caid: yup.string().required(),
      scua: yup.string().required(),
      cpf: yup.string().test('cpf', 'CPF inválido', (value) => {
        if (!value) {
          return true
        }

        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
        if (!cpfRegex.test(value)) {
          return false
        }
        const cleanCpf = value.replace(/\D/g, '')
        if (/^(\d)\1+$/.test(cleanCpf)) {
          return false
        }
        let sum = 0
        let remainder
        for (let i = 1; i <= 9; i++) {
          sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (11 - i)
        }
        remainder = (sum * 10) % 11
        if (remainder === 10 || remainder === 11) {
          remainder = 0
        }
        if (remainder !== parseInt(cleanCpf.substring(9, 10), 10)) {
          return false
        }
        sum = 0
        for (let i = 1; i <= 10; i++) {
          sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (12 - i)
        }
        remainder = (sum * 10) % 11
        if (remainder === 10 || remainder === 11) {
          remainder = 0
        }
        if (remainder !== parseInt(cleanCpf.substring(10, 11), 10)) {
          return false
        }
        return true
      }),
    })
  }, [hasCitieSave])

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      state: route?.params?.item?.state,
      city: route?.params?.item?.city,
      caid: route?.params?.item?.caid,
      scua: route?.params?.item?.scua,
      cpf: route?.params?.item?.cpf,
    },
  })

  const cpfComplete = watch('cpf')

  function comecaComT(str: string): boolean {
    return str.startsWith('T')
  }

  async function deletePendingSubmit(itemToDelete: SubmitData) {
    const storedPendingSubmits = await AsyncStorage.getItem('pendingSubmits')
    let pendingSubmitsList = storedPendingSubmits ? JSON.parse(storedPendingSubmits) : []

    pendingSubmitsList = pendingSubmitsList.filter(
      (item: SubmitData) =>
        !(
          item.caid === itemToDelete.caid &&
          item.scua === itemToDelete.scua &&
          item.date === itemToDelete.date
        )
    )

    await AsyncStorage.setItem('pendingSubmits', JSON.stringify(pendingSubmitsList))
  }

  function removerCaracteresEspeciaisCPF(cpf: string): string {
    return cpf.replace(/[.-]/g, '')
  }

  const closeAllModel = () => {
    setModalQrcode(false)
    setModalVisible(false)
    setInfoModalVisible(false)
    setLoading(false)
    setInfoModalVisibleError(false)

    setHasValidationPost(false)
    setModalVisibleNewCpf(false)
    setLoading(false)
  }

  const showModalError = (message?: string) => {
    setTextModal(message ?? 'Houve um erro interno, tente novamente em instantes.')

    setHasValidation(false)
    setHasValidationPost(false)
    setLoading(false)
    setInfoModalVisibleError(true)
  }

  const showModalSucess = (message?: string) => {
    setTextModal(message ?? 'Operação bem sucedida.')

    closeAllModel()
    setInfoModalVisible(true)

    setLoading(false)
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
      const token = await messaging().getToken()
      return token
    }
    return ''
  }

  function getLocation() {
    Geolocation.getCurrentPosition(
      async (position) => {
        setGeolocation({
          lat: `${position.coords.latitude}`,
          lng: `${position.coords.longitude}`,
        })
      },
      (error) => {
        console.log(error.code, error.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
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
    await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
      carPlay: true,
      provisional: false,
      announcement: false,
    })
  }

  useEffect(() => {
    requestLocationPermission().then(getLocation)
    requestPermission()
  }, [])

  const sendGeoTokenData = async () => {
    await api.post(
      '/vxAppid',
      {
        latitude: geolocation?.lat ?? '',
        longitude: geolocation?.lng ?? '',
        id: await getToken(),
      },
      config
    )
  }

  const sendRequestData = async () => {
    try {
      if (dataForSubmit?.scua && comecaComT(data.scua)) {
        if (dataForSubmit?.cpf?.length === 14) {
          await api.post(
            'vx10habsky',
            {
              caid: data.caid,
              cpf: cpfComplete,
            },
            config
          )

          showModalSucess()

          Linking.openURL(
            `https://www.novaparabolica.com.br/ativar-equipamento?caid=${data?.caid}&scua=${data?.scua}`
          )
        } else {
          Linking.openURL(
            `https://www.novaparabolica.com.br/ativar-equipamento?caid=${data?.caid}&scua=${data?.scua}`
          )
          showModalSucess()
        }
      } else {
        await api.post(
          'vx10hab',
          {
            caid: data.caid,
            scid: data.scua,
            cod_cidade: `${cities.find((it) => it.text === dataForSubmit.city)?.value}`,
            origem: 'VXAPP',
            cpf: dataForSubmit?.cpf,
          },
          config
        )
        showModalSucess()
      }

      const item = route?.params?.item
      await deletePendingSubmit(item)
      await sendGeoTokenData()
    } catch (er) {
      console.log(er)
      showModalError()
    }
  }

  const confirmSubmit = async (data: {
    cpf?: string
    state?: string
    city: string
    caid: string
    scua: string
    isForIgnoreCpf?: boolean
  }) => {
    await AsyncStorage.setItem('newCity', data.city)
    try {
      setLoading(true)

      await api.get(`getcaid/${data.caid}/${data.scua}`, config)

      // se existir caid e existir cpf mas o cpf não é cadastrado
      if (data?.cpf) {
        const respCpf = await api.get(
          `vx10cad?cpf=${removerCaracteresEspeciaisCPF(data.cpf)}`,
          config
        )
        const isCpfForCreate = respCpf?.data?.resposta === 'N'
        if (isCpfForCreate) {
          setModalVisibleNewCpf(isCpfForCreate)
          setLoading(false)
          return
        }
      }
      await sendRequestData()
    } catch (er: any) {
      console.log(er)
      let erMessage =
        er.response?.data?.mensagem ?? 'Houve um erro interno, tente novamente em instantes.'

      if (er.response?.status === 404) {
        erMessage = 'O CAID/SCID não foi encontrado'
      }
      showModalError(erMessage)
    }
  }

  const onSubmit = async (data: {
    cpf?: string
    state?: string
    city: string
    caid: string
    scua: string
  }) => {
    confirmSubmit(data)
  }
  function handleError(message: string) {
    setTextModal(message)
    setIcon(false)
    setModalVisible(true)
  }

  async function getConnectionInfo() {
    setLoading(true)
    NetInfo.fetch().then(async (state) => {
      setHasConnection(state.isConnected ?? false)
      setLoading(false)
    })
  }

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      getConnectionInfo()
    })

    getConnectionInfo()

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    async function getCities() {
      let dataList = []

      const storedData = await AsyncStorage.getItem('dataList')
      if (storedData) {
        dataList = JSON.parse(storedData)
        setHasCitieSave(dataList.length > 0)
      }

      const storedDataCity = await AsyncStorage.getItem('newCity')
      if (
        storedDataCity &&
        dataList.find((it: { id: number; city: string }) => it.city === storedDataCity)
      ) {
        setValue('city', storedDataCity)
      }
      setCities(
        dataList.map((it: { id: number; city: string; state: string }) => {
          return {
            value: it.id,
            text: it.city,
            state: it.state,
          }
        })
      )
    }
    getCities()
  }, [state, hasConnection])

  useEffect(() => {
    async function getStates() {
      if (hasConnection) {
        const { data } = await api.get('vxappestados', config)

        setStates(
          data.map((it: { id: number; sigla: string }) => {
            return {
              value: it.id,
              text: it.sigla,
            }
          })
        )
      }
    }
    getStates()
  }, [hasConnection])

  useEffect(() => {
    if (!hasConnection || !!errors?.cpf) return
    if (data?.caid || data?.scua) {
      setValue('caid', data?.caid || '')
      setValue('scua', data?.scua || '')
      trigger('scua')
      trigger('caid')

      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
      async function fetchHabSky() {
        if (data?.scua && comecaComT(data.scua) && hasValidationPost) {
          if (hasCpf && cpfComplete?.length === 14) {
            api.get(`getcaid/${data.caid}/${data.scua}`, config).then(async () => {
              api
                .post(
                  'vx10habsky',
                  {
                    caid: data.caid,
                    cpf: cpfComplete,
                  },
                  config
                )
                .then(() => {
                  Linking.openURL(
                    `https://www.novaparabolica.com.br/ativar-equipamento?caid=${data?.caid}&scua=${data?.scua}`
                  )
                })
            })
          } else {
            api.get(`getcaid/${data.caid}/${data.scua}`, config).then(async () => {
              Linking.openURL(
                `https://www.novaparabolica.com.br/ativar-equipamento?caid=${data?.caid}&scua=${data?.scua}`
              )
            })
          }
          setHasValidationPost(false)
        }
      }
    }
  }, [data, cpfComplete, hasCpf, errors, hasConnection, hasValidation, TOKEN, hasValidationPost])

  useEffect(() => {
    if (data?.caid || data?.scua) {
      setValue('caid', data?.caid || '')
      setValue('scua', data?.scua || '')
      trigger('scua')
      trigger('caid')
    }
  }, [data])

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Ativação Pendente' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary title='Ativação Pendente' />
      <Container>
        <Line marginTop={24}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
            Salvo em
          </Label>
        </Line>
        <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE} lineHeight={20}>
          {route.params.item?.date
            ? format(new Date(`${route.params.item?.date}`), "dd.MM.yy 'às' HH:mm")
            : format(new Date(), "dd.MM.yy 'às' HH:mm")}
        </Label>
        <Line marginTop={24}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
            CAID
          </Label>
        </Line>
        <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE} lineHeight={20}>
          {route.params.item?.caid}
        </Label>
        <Line marginTop={24}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
            SCUA
          </Label>
        </Line>
        <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE} lineHeight={20}>
          {route.params.item?.scua}
        </Label>
        <Line marginTop={24}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
            Cidade
          </Label>
        </Line>
        <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE} lineHeight={20}>
          {route.params.item?.city}
        </Label>
        <Line marginTop={24}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
            Cidade
          </Label>
        </Line>
        <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE} lineHeight={20}>
          {cities.find((it) => it.text === route.params.item.city)?.state}
        </Label>
        {route.params.item?.cpf && (
          <>
            <Line marginTop={24}>
              <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
                CPF do Instalador
              </Label>
            </Line>
            <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE} lineHeight={20}>
              {route.params.item?.cpf}
            </Label>
          </>
        )}
        {isOpen ? (
          <></>
        ) : (
          <View
            style={{
              position: 'absolute',
              bottom: normalize(20),
              left: normalize(24),
              width: '100%',
            }}
          >
            <Button
              text='Fazer Sincronização'
              disabled={false}
              onPress={handleSubmit(onSubmit)}
              color={theme.COLORS.SECONDARY_400}
            />
            <View style={{ marginTop: 16 }} />
            <Button
              text='Cancelar Ativação'
              onPress={() => setModalDelete(true)}
              color={theme.COLORS.SHAPE}
              textColor={theme.COLORS.SECONDARY_400}
            />
          </View>
        )}
      </Container>

      <ModalQrcode
        transparent
        modalIsVisible={modalQrcode}
        onChangeVisible={() => setModalQrcode(false)}
        setData={setData}
        handleError={handleError}
      />

      {/* <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalVisible}
        onChangeVisible={() => setModalVisible(false)}
        message={textModal}
        buttonText='Entendi'
        icon={icon ? 'success' : 'error'}
        hasButtonCpf={false}
      /> */}

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={infoModalVisible}
        onChangeVisible={() => {
          navigation.goBack()
          setInfoModalVisible(false)
        }}
        message='Operação bem sucedida'
        buttonText='Entendi'
        hasButtonCpf={false}
        icon={'success'}
      />

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={infoModalVisibleError}
        onChangeVisible={() => {
          closeAllModel()
        }}
        message={textModal}
        buttonText='Entendi'
        hasButtonCpf={false}
        icon={'error'}
      />

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalVisibleNewCpf}
        title={'CPF Não Cadastrado'}
        onChangeVisible={() => {
          setModalVisibleNewCpf(false)
        }}
        document={cpfComplete}
        message={
          'Preencha seus dados para se cadastrar nas campanhas da VIVENSIS! Concorra a uma moto e uma TV todo mês e a um carro no final do ano!'
        }
        buttonText='Entendi'
        icon={'alert'}
        hasButtonCpf
        hiddenBorder
        isActionSend
        actionSend={async () => {
          await sendRequestData()
        }}
      />

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalVisible}
        title={isCpfNew ? 'CPF Não Cadastrado' : ''}
        onChangeVisible={() => {
          setModalVisible(false)
        }}
        document={cpfComplete}
        message={
          isCpfNew
            ? 'Preencha seus dados para se cadastrar nas campanhas da VIVENSIS! Concorra a uma moto e uma TV todo mês e a um carro no final do ano!'
            : textModal
        }
        buttonText='Entendi'
        icon={icon && !isCpfNew ? 'success' : isCpfNew ? 'alert' : 'error'}
        hasButtonCpf={hasCpf && isCpfNew}
        hiddenBorder
        isActionSend={isCpfNew}
        actionSend={() => {
          setModalVisible(false)
          setModalWithOutCpf(false)
          confirmSubmit({ ...dataForSubmit, isForIgnoreCpf: true })
        }}
      />
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalDelete}
        onChangeVisible={async () => {
          await deletePendingSubmit(route.params.item)
          setModalSuccessDelete(false)
          navigation.goBack()
        }}
        closeButton={() => {
          setModalDelete(false)
        }}
        message='Essa ação é irreversível, você tem certeza?'
        buttonText='Sim, Quero Deletar'
        secondButtonText='Não, Cancelar'
        title='Deletar ativação'
        actionSecond={() => {
          setModalDelete(false)
        }}
        icon={'alert'}
      />
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalSuccessDelete}
        onChangeVisible={() => {
          setModalSuccessDelete(false)
          navigation.goBack()
        }}
        closeButton={() => {
          setModalSuccessDelete(true)
        }}
        message='Deletado com sucesso'
        buttonText='Voltar'
        icon='success'
        // icon={icon ? 'success' : 'error'}
      />
    </KeyboardAwareScrollView>
  )
}
