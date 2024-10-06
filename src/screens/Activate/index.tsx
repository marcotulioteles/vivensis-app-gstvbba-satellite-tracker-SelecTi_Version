import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from 'styled-components'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { Container } from './styles'
import { useFocusEffect } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { cpfMask, normalize } from '~/utils'
import { Label } from '~/components/Label/variants'
import Geolocation from 'react-native-geolocation-service'
import messaging from '@react-native-firebase/messaging'

import NetInfo from '@react-native-community/netinfo'
import { Line } from '~/components/Containers/styles'
import { InputButton } from '~/components/InputButton'
import { AxiosRequestConfig } from 'axios'
import { Input } from '~/components/Input'
import ModalQrcode from '~/components/ModalQrcode'
import useKeyboardHook from '~/hooks/KeyboardOpen'
import api from '~/services/api'
import { TOKEN } from '@env'
import ModalInfo from '~/components/ModalInfo'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { IconStyled } from '../Home/styles'

export const Activate = () => {
  const theme = useTheme()
  const { isOpen } = useKeyboardHook()

  const [textModal, setTextModal] = useState('')
  const [hasValidation, setHasValidation] = useState(false)
  const [hasValidationPost, setHasValidationPost] = useState(false)
  const [modalQrcode, setModalQrcode] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalVisibleNewCpf, setModalVisibleNewCpf] = useState(false)
  const [icon, setIcon] = useState(false)
  const [hasCpf, setHasCpf] = useState(false)
  const [isCpfNew, setIsCpfNew] = useState(false)
  const [stepOne, setStepOne] = useState(true)
  const [data, setData] = useState({
    scua: '',
    caid: '',
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
    }[]
  >([])
  const [state, setState] = useState('')

  const [loading, setLoading] = useState(true)
  const [hasConnection, setHasConnection] = useState(false)
  const [hasCitieSave, setHasCitieSave] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [infoModalVisibleError, setInfoModalVisibleError] = useState(false)
  const [modalWithOutCpf, setModalWithOutCpf] = useState(false)
  const [infoModalInfoCpf, setInfoModalInfoCpf] = useState(false)

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }

  const [token, setToken] = useState('')
  const [geolocation, setGeolocation] = useState({
    lat: '',
    lng: '',
  })

  const [dataForSubmit, setDataForSubmit] = useState<{
    cpf?: string
    state?: string
    city: string
    caid: string
    scua: string
  }>({
    cpf: '',
    state: '',
    city: '',
    caid: '',
    scua: '',
  })

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
    control,
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
      state: '',
      city: '',
      caid: '',
      scua: '',
      cpf: '',
    },
  })

  const cpfComplete = watch('cpf')

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
    const authorizationStatus = await messaging().requestPermission({
      alert: true,
      badge: true,
      sound: true,
      carPlay: true,
      provisional: false,
      announcement: false,
    })

    if (authorizationStatus) {
      if (Platform.OS === 'ios') await messaging().registerDeviceForRemoteMessages()
      if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        setToken(await getToken())
      }
    }
  }

  useEffect(() => {
    requestLocationPermission().then(getLocation)
    requestPermission()
    // Retrieve stored CPF on component mount
    AsyncStorage.getItem('cpfInstalador').then((cpf) => {
      if (cpf) {
        setValue('cpf', cpf)
        trigger('cpf')
      }
    })
  }, [])

  function comecaComT(str: string): boolean {
    return str.startsWith('T')
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

  const sendRequestData = async (dataToSubmit: {
    cpf?: string
    state?: string
    city: string
    caid: string
    scua: string
    isForIgnoreCpf?: boolean
  }) => {
    try {
      if (dataToSubmit?.scua && comecaComT(dataToSubmit?.scua)) {
        if (dataToSubmit?.cpf?.length === 14) {
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
        // Save CPF to local storage after successful activation
        if (cpfComplete?.length) await AsyncStorage.setItem('cpfInstalador', cpfComplete ?? '')
      } else {
        await api.post(
          'vx10hab',
          {
            caid: dataToSubmit.caid,
            scid: dataToSubmit.scua,
            cod_cidade: `${cities.find((it) => it.text === dataToSubmit.city)?.value}`,
            origem: 'VXAPP',
            cpf: dataToSubmit?.cpf,
          },
          config
        )
        showModalSucess()
        // Save CPF to local storage after successful activation
        if (cpfComplete?.length) await AsyncStorage.setItem('cpfInstalador', cpfComplete ?? '')
      }
      setData({
        scua: '',
        caid: '',
      })
      setValue('caid', '')
      setValue('scua', '')
      setDataForSubmit({
        ...dataToSubmit,
        caid: '',
        scua: '',
      })
    } catch (er) {
      console.log(er)
      showModalError()
    } finally {
      await sendGeoTokenData()
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
    setDataForSubmit(data)
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
      await sendRequestData(data)
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
    setDataForSubmit(data)
    if (data?.cpf?.length) {
      await confirmSubmit(data)
      return
    }
    setModalWithOutCpf(true)
  }

  function handleError(message: string) {
    setTextModal(message)
    setIcon(false)
    setModalVisible(true)
  }

  useFocusEffect(
    useCallback(() => {
      async function getNetInfo() {
        setLoading(true)
        NetInfo.fetch().then((state) => {
          setHasConnection(state.isConnected ?? false)
        })
        setLoading(false)
      }
      getNetInfo()
    }, [])
  )

  useEffect(() => {
    async function getCities() {
      let dataList = []

      const storedData = await AsyncStorage.getItem('dataList')
      if (storedData) {
        dataList = JSON.parse(storedData)
        setHasCitieSave(dataList.length > 0)
      }
      if (state?.length && hasConnection) {
        if (!dataList.length) {
          try {
            const { data } = await api.get(`vxappcidades/${state}`, config)
            setCities(
              data?.map((it: { id: number; nome: string }) => {
                return {
                  value: it.id,
                  text: it.nome,
                }
              })
            )
          } catch (er) {
            console.log(er, 'aqui')
          }
        } else {
          const storedDataCity = await AsyncStorage.getItem('newCity')
          if (
            storedDataCity &&
            dataList.find((it: { id: number; city: string }) => it.city === storedDataCity)
          ) {
            setValue('city', storedDataCity)
          }
          setCities(
            dataList.map((it: { id: number; city: string }) => {
              return {
                value: it.id,
                text: it.city,
              }
            })
          )
        }
      } else {
        const storedDataCity = await AsyncStorage.getItem('newCity')
        if (
          storedDataCity &&
          dataList.find((it: { id: number; city: string }) => it.city === storedDataCity)
        ) {
          setValue('city', storedDataCity)
        }
        setCities(
          dataList.map((it: { id: number; city: string }) => {
            return {
              value: it.id,
              text: it.city,
            }
          })
        )
      }
    }
    getCities()
  }, [state, hasConnection])

  useEffect(() => {
    async function getStates() {
      if (hasConnection) {
        try {
          const { data } = await api.get('vxappestados', config)

          setStates(
            data?.map((it: { id: number; sigla: string }) => {
              return {
                value: it.id,
                text: it.sigla,
              }
            })
          )
        } catch (er: any) {
          console.log({ ...er })
          console.log(er?.data?.response)
        }
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
      <HeaderSecondary title='Ativação' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps
    >
      <HeaderSecondary title='Ativação' />
      <Container>
        {hasCitieSave ? null : (
          <>
            <Line marginTop={4}>
              <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                UF
              </Label>
            </Line>
            <Controller
              control={control}
              name='state'
              render={({ field: { onChange, onBlur, value } }) => (
                <InputButton
                  placeholder={'Selecione a UF'}
                  accessibilityLabel={'Selecione a UF'}
                  testID='uf'
                  defaultValue=''
                  value={value}
                  hasValidation
                  hasFilter={false}
                  autoCorrect={false}
                  onBlur={() => {
                    onBlur()
                    trigger('state')
                  }}
                  editable
                  setState={(e) => {
                    onChange(e as string)
                    setState(e as string)
                    trigger('state')
                    setValue('city', '')
                    trigger('city')
                  }}
                  autoCapitalize='none'
                  error={!!errors?.state}
                  label='UF'
                  options={states.map((it) => {
                    return {
                      key: `${it.value}`,
                      name: it.text,
                    }
                  })}
                  message='UF'
                />
              )}
            />
          </>
        )}
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Cidade
          </Label>
        </Line>
        <Controller
          control={control}
          name='city'
          render={({ field: { onChange, onBlur, value } }) => (
            <InputButton
              placeholder={'Selecione a cidade'}
              accessibilityLabel={'Selecione a cidade'}
              testID='city'
              defaultValue=''
              hasFilter
              value={value}
              hasValidation
              editable={hasCitieSave ? true : !!state}
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('city')
              }}
              setState={(e) => {
                onChange(e as string)
                trigger('city')
              }}
              autoCapitalize='none'
              error={!!errors?.city}
              label='Cidade'
              options={cities.map((it) => {
                return {
                  key: `${it.value}`,
                  name: it.text,
                }
              })}
              message='Cidade'
            />
          )}
        />
        <Line marginTop={20}>
          <TouchableOpacity
            onPress={() => setModalQrcode(true)}
            style={{
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
              width: '100%',
            }}
          >
            <IconStyled
              name='qrcode'
              color={theme.COLORS.PRIMARY_500}
              size={20}
              style={{ marginRight: 8 }}
            />
            <Label fontSize={14} isMedium textAlign='center' color={theme.COLORS.PRIMARY_500}>
              Escanear código
            </Label>
          </TouchableOpacity>
        </Line>
        <Line marginTop={20}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            CAID
          </Label>
        </Line>
        <Controller
          control={control}
          name='caid'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe o código'}
              accessibilityLabel={'Informe o código'}
              testID='caid'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('caid')
              }}
              onChangeText={(e) => {
                onChange(e)
                trigger('caid')
                setData((stt) => {
                  return {
                    scua: stt?.scua || '',
                    caid: e,
                  }
                })
              }}
              error={!!errors?.caid}
              label='CAID'
            />
          )}
        />
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            SCUA
          </Label>
        </Line>
        <Controller
          control={control}
          name='scua'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe o código'}
              accessibilityLabel={'Informe o código'}
              testID='scua'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('scua')
              }}
              onChangeText={(e) => {
                onChange(e)
                trigger('scua')
                setData((stt) => {
                  return {
                    scua: e,
                    caid: stt?.caid || '',
                  }
                })
              }}
              error={!!errors?.scua}
              label='SCUA'
            />
          )}
        />
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            CPF do Instalador
          </Label>

          <TouchableOpacity onPress={() => setInfoModalInfoCpf(true)} style={{ marginLeft: 8 }}>
            <IconStyled
              name='information-outline'
              color={theme.COLORS.PRIMARY_500}
              size={20}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        </Line>
        <Controller
          control={control}
          name='cpf'
          rules={{
            validate: async () => {
              return await schema
                .validateAt('cpf', { cpf: getValues('cpf') })
                .then(() => true)
                .catch((error) => error.message)
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'CPF do Instalador'}
              accessibilityLabel={'CPF do Instalador'}
              testID='cpf'
              defaultValue=''
              value={value}
              hasValidation
              keyboardType='numeric'
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('cpf')
              }}
              maxLength={14}
              onChangeText={(e) => {
                onChange(cpfMask(e))
                if (e.length === 14) setValue('cpf', e)
                trigger('cpf')
              }}
              error={!!errors?.cpf}
              label='CPF'
              errorText='CPF inválido'
            />
          )}
        />

        {isOpen ? (
          <></>
        ) : (
          <View
            style={{
              position: 'absolute',
              bottom: normalize(40),
              left: normalize(24),
              width: '100%',
            }}
          >
            <Button
              text='Ativar'
              disabled={
                !hasConnection ||
                !getValues('caid') ||
                !getValues('city') ||
                !getValues('scua') ||
                !!errors?.cpf
              }
              onPress={handleSubmit(onSubmit)}
              color={theme.COLORS.SECONDARY_400}
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

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={infoModalVisible}
        onChangeVisible={() => {
          setModalQrcode(false)
          setModalVisible(false)
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
        modalIsVisible={infoModalInfoCpf}
        onChangeVisible={() => {
          setInfoModalInfoCpf(false)
        }}
        message='A cada VX habilitado com o CPF, você ganha um cupom da sorte para concorrer mensalmente a 1 moto e TV e a 1 carro no final do ano.'
        buttonText='Entendi'
        hasButtonCpf={false}
        icon={'alert'}
        hasInfoRegulament
      />

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalWithOutCpf}
        onChangeVisible={() => setModalWithOutCpf(false)}
        message='A cada VX habilitado com o CPF, você ganha um cupom da sorte para concorrer mensalmente a 1 moto e TV e a 1 carro no final do ano.'
        buttonText='Quero Participar'
        secondButtonText='Não Quero Participar'
        title='CPF em Branco'
        hasInfoRegulament
        actionSecond={() => {
          setModalVisible(false)
          setModalWithOutCpf(false)
          confirmSubmit(dataForSubmit)
        }}
        icon={'alert'}
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
          await sendRequestData(dataForSubmit)
        }}
      />
    </KeyboardAwareScrollView>
  )
}
