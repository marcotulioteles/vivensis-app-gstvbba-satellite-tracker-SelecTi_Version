import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from 'styled-components'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import { Container } from './styles'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { cpfMask, normalize } from '~/utils'
import { Label } from '~/components/Label/variants'

import NetInfo from '@react-native-community/netinfo'
import { Line } from '~/components/Containers/styles'
import { InputButton } from '~/components/InputButton'
import { Input } from '~/components/Input'
import ModalQrcode from '~/components/ModalQrcode'
import useKeyboardHook from '~/hooks/KeyboardOpen'
import ModalInfo from '~/components/ModalInfo'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { IconStyled } from '../Home/styles'
import { STATES_BR } from './states'
import { AlertIconOutline } from '~/assets/svgs'

export const ActivateOffline = () => {
  const theme = useTheme()
  const { isOpen } = useKeyboardHook()
  const navigation = useNavigation()

  const [textModal, setTextModal] = useState('')
  const [modalQrcode, setModalQrcode] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [icon, setIcon] = useState(false)
  const [hasCpf, setHasCpf] = useState(false)
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
  const [modalWithOutCpf, setModalWithOutCpf] = useState(false)
  const [modalSaveSuccessLocale, setModalSaveSuccessLocale] = useState(false)
  const [infoModalInfoCpf, setInfoModalInfoCpf] = useState(false)

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

  const successAfterSubmit = (hasCpf?: boolean) => {
    setModalVisible(true)
    setTextModal('Operação bem sucedida')
    setIcon(true)
    setHasCpf(hasCpf ?? false)

    setLoading(false)
  }
  const confirmSubmit = async (data: {
    cpf?: string
    state?: string
    city: string
    caid: string
    scua: string
  }) => {
    await AsyncStorage.setItem('newCity', data.city)
    try {
      setLoading(true)

      try {
        const pendingSubmits = await AsyncStorage.getItem('pendingSubmits')
        const pendingSubmitsList = pendingSubmits ? JSON.parse(pendingSubmits) : []

        const alreadyExists = pendingSubmitsList.some(
          (item: { caid: string; scua: string }) =>
            item.caid === data.caid && item.scua === data.scua
        )
        if (alreadyExists) {
          setTextModal('Já existe uma ativação com esse CAID e SCUA na fila de sincronização.')
          setIcon(false)
          setLoading(false)
          setModalVisible(true)
        } else {
          pendingSubmitsList.push({ ...data, date: new Date() })
          await AsyncStorage.setItem('pendingSubmits', JSON.stringify(pendingSubmitsList))
          if (data?.cpf) await AsyncStorage.setItem('cpfInstalador', data?.cpf ?? '')
          successAfterSubmit(!!data?.cpf)
          successAfterSubmit(!!data?.cpf)
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    } catch (er: any) {
      setTextModal(er.response?.data?.mensagem || '')
      setIcon(false)
      if (er.response?.status === 500) {
        setTextModal('Houve um erro interno')
      }
      if (er.response?.status === 404) {
        setTextModal('O CAID/SCID não foi encontrado')
      }
      setLoading(false)
      setModalVisible(true)
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
      confirmSubmit(data)
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
          setHasConnection(state.isConnected || false)
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
    getCities()
  }, [state, hasConnection])

  useEffect(() => {
    async function getStates() {
      setStates(
        STATES_BR.map((it: { id: number; sigla: string }) => {
          return {
            value: `${it.id}`,
            text: it.sigla,
          }
        })
      )
    }
    getStates()
  }, [hasConnection])

  useEffect(() => {
    if (data?.caid || data?.scua) {
      setValue('caid', data?.caid || '')
      setValue('scua', data?.scua || '')
      trigger('scua')
      trigger('caid')
    }
  }, [data])

  useEffect(() => {
    // Retrieve stored CPF on component mount
    AsyncStorage.getItem('cpfInstalador').then((cpf) => {
      if (cpf) {
        setValue('cpf', cpf)
        trigger('cpf')
      }
    })
  }, [])

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Ativação offline' />
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
    >
      <HeaderSecondary title='Ativação offline' />
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
              editable={hasCitieSave && cities.length > 0 ? true : !!state && cities.length > 0}
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
        {!hasCitieSave || (hasCitieSave && !cities.length) ? (
          <View style={{ flexDirection: 'row' }}>
            <AlertIconOutline style={{ marginRight: 4, marginTop: 4 }} />
            <Label textAlign='left' color='#E02D3C' fontSize={10} lineHeight={14}>
              {`Você não possui uma Cidade Favorita para essa UF 
Conecte-se a internet para carregar a lista completa`}
            </Label>
          </View>
        ) : null}
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
              keyboardType='numeric'
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
                !getValues('caid') || !getValues('city') || !getValues('scua') || !!errors?.cpf
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
        modalIsVisible={modalVisible}
        onChangeVisible={() => setModalVisible(false)}
        message={textModal}
        buttonText='Entendi'
        icon={icon ? 'success' : 'error'}
        hasButtonCpf={false}
      />

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={infoModalVisible}
        onChangeVisible={() => setInfoModalVisible(false)}
        message='Informe seu CPF para participar de promoções'
        buttonText='Entendi'
        // icon={icon ? 'success' : 'error'}
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
        modalIsVisible={modalSaveSuccessLocale}
        icon='success'
        onChangeVisible={() => {
          setModalSaveSuccessLocale(false)
          navigation.goBack()
        }}
        loading={false}
        transparent
        message='Ativação salva para lançamento futuro.'
      />
    </KeyboardAwareScrollView>
  )
}
