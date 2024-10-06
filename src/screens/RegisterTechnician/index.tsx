import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from 'styled-components'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, Platform, View, TouchableOpacity } from 'react-native'
import { Container } from './styles'
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { celularMask, cepMask, cpfMask } from '~/utils'
import { Label } from '~/components/Label/variants'

import NetInfo from '@react-native-community/netinfo'
import { Line } from '~/components/Containers/styles'
import { AxiosRequestConfig } from 'axios'
import { Input } from '~/components/Input'
import useKeyboardHook from '~/hooks/KeyboardOpen'
import api from '~/services/api'
import { TOKEN } from '@env'
import ModalInfo from '~/components/ModalInfo'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { RootBottomTabParamList } from '~/routes'
import { ContainerInput } from '~/components/ModalFilter/styles'
import { format } from 'date-fns'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { RFValue } from 'react-native-responsive-fontsize'
import ModalDate from '~/components/ModalDate'
import CheckBox from '@react-native-community/checkbox'

type RegisterTechnicianScreenRouteProp = RouteProp<RootBottomTabParamList, 'RegisterTechnician'>
export const RegisterTechnician = () => {
  const route = useRoute<RegisterTechnicianScreenRouteProp>()
  const theme = useTheme()
  const { isOpen } = useKeyboardHook()

  const [textModal, setTextModal] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [icon, setIcon] = useState(false)

  const [isSelected, setIsSelected] = useState(false)

  const [date, setDate] = useState<Date>()
  const [modalVisibleDate, setModalVisibleDate] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const onChange = (event: DateTimePickerEvent, selectedDate: any) => {
    const currentDate = selectedDate
    setDate(currentDate)
    setShowPicker(false)
  }

  const navigation = useNavigation()

  const [loading, setLoading] = useState(true)
  const [hasConnection, setHasConnection] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [modalDelete, setModalDelete] = useState(false)

  const [ibgeCode, setIbgeCode] = useState('')
  const [modalSuccessDelete, setModalSuccessDelete] = useState(false)

  const schema: any = useMemo(() => {
    return yup.object().shape({
      state: yup.string().required(),
      city: yup.string().required(),
      phone: yup.string().required(),
      cep: yup.string().required().min(9, 'O CEP deve ter pelo menos 9 caracteres'),
      address: yup.string().required(),
      number: yup.string().required(),
      complement: yup.string(),
      neighbohood: yup.string().required(),
      name: yup.string().required(),
      cpf: yup
        .string()
        .test('cpf', 'CPF inválido', (value) => {
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
        })
        .required(),
    })
  }, [])

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
      cpf: route?.params?.document ?? '',
      phone: '',
      cep: '',
      address: '',
      number: '',
      complement: '',
      neighbohood: '',
      name: '',
    },
  })

  const cep = watch('cep')

  const onSubmit = async (data: {
    state: string
    phone: string
    cep: string
    address: string
    number: string
    complement?: string
    neighbohood: string
    name: string
    city: string
    cpf?: string
  }) => {
    if (!date || !isSelected) return
    try {
      const body = {
        cpf: route.params.document?.length ? route.params.document : data?.cpf,
        nome: data.name,
        dta_nascimento: format(date, 'dd/MM/yyyy'),
        ddd: data.phone.substring(1, 3),
        telefone: data.phone.substring(4, 15),
        cep: data.cep.replace(/\D/g, ''),
        endereco: data.address,
        numero: data.number,
        complemento: data.complement,
        bairro: data.neighbohood,
        cidade: data.city,
        uf: data.state,
      }
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
      await api.post('/vx10cad', body, config)
      await AsyncStorage.setItem(
        'cpfInstalador',
        route.params.document?.length ? route.params.document : data?.cpf ?? ''
      )
      setTextModal('Técnico cadastrado com sucesso.')
      setIcon(true)
      setModalVisible(true)
    } catch (er: any) {
      console.log(er.response.data)
      handleError(er.response?.data?.mensagem || '')
      setLoading(false)
    }
  }

  function handleError(message: string) {
    setTextModal(message)
    setIcon(false)
    setModalVisible(true)
  }

  useEffect(() => {
    const loadCep = async () => {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
      if (cep && cep.length === 9) {
        const respCep = await api.get(`/GetEndereco/${cep.replace(/\D/g, '')}`, config)

        setValue('address', respCep.data.Endereco)
        setValue('state', respCep.data.UF)
        setValue('neighbohood', respCep.data.Bairro)
        setValue('city', respCep.data.Cidade)
        setIbgeCode(respCep.data.IBGE)
      }
    }
    loadCep()
  }, [cep])

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

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Cadastrar Técnico' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <HeaderSecondary title='Cadastrar Técnico' />
      <Container>
        <Line marginTop={20}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            CPF
          </Label>
        </Line>
        <Controller
          control={control}
          name='cpf'
          rules={{
            validate: async () => {
              return await schema
                .validateAt('cpf', { cpf: getValues('cpf') })
                .then(() => true)
                .catch((error: any) => error.message)
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe o seu CPF'}
              accessibilityLabel={'Informe o seu CPF'}
              testID='cpf'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('cpf')
              }}
              editable={!route?.params?.document}
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
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Nome
          </Label>
        </Line>
        <Controller
          control={control}
          name='name'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe o seu nome'}
              accessibilityLabel={'Informe o seu nome'}
              testID='name'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('name')
              }}
              onChangeText={(e) => {
                onChange(e)
                trigger('name')
              }}
              error={!!errors?.name}
              label='Nome'
            />
          )}
        />
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Data de Nascimento
          </Label>
        </Line>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === 'android') {
              setShowPicker(true)
              return
            }
            setModalVisibleDate(!modalVisibleDate)
          }}
        >
          <ContainerInput
            style={{
              borderColor: theme.COLORS.GRAY_02,
            }}
          >
            <Label
              fontSize={14}
              textAlign='left'
              color={date ? theme.COLORS.TITLE : theme.COLORS.GRAY_04}
            >
              {date ? `${format(date, 'dd/MM/yyyy')}` : 'No formato DD/MM/AAAA'}
            </Label>
            {/* <IconDark name='calendar-blank' size={20} /> */}
          </ContainerInput>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            testID='dateTimePicker'
            value={date ?? new Date()}
            mode='date'
            onChange={onChange}
            display='inline'
            locale='pt-BR'
            maximumDate={new Date()}
            style={{
              backgroundColor: 'white',
              flex: 1,
              alignSelf: 'flex-start',
              borderRadius: RFValue(8),
            }}
            themeVariant='light'
          />
        )}
        <Line marginTop={12}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Celular com DDD
          </Label>
        </Line>
        <Controller
          control={control}
          name='phone'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe o seu telefone de contato'}
              accessibilityLabel={'Informe o seu telefone de contato'}
              testID='phone'
              defaultValue=''
              value={value}
              hasValidation
              keyboardType='numeric'
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('phone')
              }}
              maxLength={15}
              onChangeText={(e) => {
                onChange(celularMask(e))
                trigger('phone')
              }}
              error={!!errors?.phone}
              label='Celular com DDD'
            />
          )}
        />
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            CEP
          </Label>
        </Line>
        <Controller
          control={control}
          name='cep'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe o seu CEP'}
              accessibilityLabel={'Informe o seu CEP'}
              testID='cep'
              defaultValue=''
              keyboardType='numeric'
              value={value}
              maxLength={9}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('cep')
              }}
              onChangeText={(e) => {
                onChange(cepMask(e))
                trigger('cep')
              }}
              error={!!errors?.cep}
              label='CEP'
            />
          )}
        />
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Endereço
          </Label>
        </Line>
        <Controller
          control={control}
          name='address'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe o seu endereço'}
              accessibilityLabel={'Informe o seu endereço'}
              testID='address'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('address')
              }}
              onChangeText={(e) => {
                onChange(e)
                trigger('address')
              }}
              error={!!errors?.address}
              label='Endereço'
            />
          )}
        />
        <Line marginTop={4} isBetween>
          <View style={{ flexBasis: '49%' }}>
            <Line>
              <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                Número
              </Label>
            </Line>
            <Controller
              control={control}
              name='number'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={'Número'}
                  accessibilityLabel={'Número'}
                  testID='number'
                  defaultValue=''
                  value={value}
                  hasValidation
                  autoCorrect={false}
                  onBlur={() => {
                    onBlur()
                    trigger('number')
                  }}
                  onChangeText={(e) => {
                    onChange(e)
                    trigger('number')
                  }}
                  error={!!errors?.number}
                  label='Número'
                />
              )}
            />
          </View>
          <View style={{ flexBasis: '49%' }}>
            <Line>
              <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                Complemento
              </Label>
            </Line>
            <Controller
              control={control}
              name='complement'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder={'Apto, bloco'}
                  accessibilityLabel={'Apto, bloco'}
                  testID='complement'
                  defaultValue=''
                  value={value}
                  hasValidation
                  autoCorrect={false}
                  onBlur={() => {
                    onBlur()
                    trigger('complement')
                  }}
                  onChangeText={(e) => {
                    onChange(e)
                    trigger('complement')
                  }}
                  error={!!errors?.complement}
                  label='Complemento'
                />
              )}
            />
          </View>
        </Line>
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Bairro
          </Label>
        </Line>
        <Controller
          control={control}
          name='neighbohood'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe o bairro'}
              accessibilityLabel={'Informe o bairro'}
              testID='neighbohood'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('neighbohood')
              }}
              onChangeText={(e) => {
                onChange(e)
                trigger('neighbohood')
              }}
              editable
              error={!!errors?.neighbohood}
              label='Bairro'
            />
          )}
        />
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Cidade
          </Label>
        </Line>
        <Controller
          control={control}
          name='city'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe a cidade'}
              accessibilityLabel={'Informe a cidade'}
              testID='city'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('city')
              }}
              onChangeText={(e) => {
                onChange(e)
                trigger('city')
              }}
              editable={false}
              error={!!errors?.city}
              label='Cidade'
            />
          )}
        />
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            UF
          </Label>
        </Line>
        <Controller
          control={control}
          name='state'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Informe a Unidade Federativa'}
              accessibilityLabel={'Informe a Unidade Federativa'}
              testID='state'
              defaultValue=''
              value={value}
              editable={false}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('state')
              }}
              onChangeText={(e) => {
                onChange(e)
                trigger('state')
              }}
              error={!!errors?.state}
              label='UF'
            />
          )}
        />

        <Line
          marginTop={12}
          marginBottom={24}
          style={{
            alignItems: 'flex-start',
          }}
        >
          <CheckBox
            value={isSelected}
            onValueChange={setIsSelected}
            style={{ alignSelf: 'center', width: 24, height: 24, marginRight: 8, marginTop: 6 }}
            boxType='square'
            onTintColor={theme.COLORS.SECONDARY_400}
            tintColor={theme.COLORS.SECONDARY_400}
            onCheckColor={theme.COLORS.WHITE}
            onFillColor={theme.COLORS.SECONDARY_400}
          />
          <Label
            fontSize={14}
            textAlign='left'
            color={theme.COLORS.PRIMARY_500}
            style={{
              maxWidth: '90%',
            }}
          >
            Declaro que li a política de privacidade da VIVENSIS e estou de acordo com a utilização
            dos meus dados pessoais nas campanhas da VIVENSIS e parceiros oficiais
          </Label>
        </Line>

        {isOpen ? (
          <></>
        ) : (
          <View
            style={{
              width: '100%',
            }}
          >
            <Button
              text='Concluir Cadastro'
              disabled={
                !hasConnection ||
                !getValues('city') ||
                !!errors?.cpf ||
                !isSelected ||
                !date ||
                !getValues('phone') ||
                !getValues('cep') ||
                !getValues('address') ||
                !getValues('number') ||
                !getValues('neighbohood') ||
                !getValues('state') ||
                !getValues('city') ||
                !getValues('cpf')
              }
              onPress={handleSubmit(onSubmit)}
              color={theme.COLORS.SECONDARY_400}
            />
            <View style={{ marginTop: 16 }} />
            {route?.params?.document ? (
              <Button
                text='Cancelar Ativação'
                onPress={() => setModalDelete(true)}
                color={theme.COLORS.SHAPE}
                textColor={theme.COLORS.SECONDARY_400}
              />
            ) : null}
          </View>
        )}

        <Line marginTop={40}></Line>
        <ModalInfo
          transparent
          loading={false}
          modalIsVisible={infoModalVisible}
          onChangeVisible={() => setInfoModalVisible(false)}
          message='Informe seu CPF para participar de promoções'
          buttonText='Entendi'
        />
        <ModalDate
          message='Data de Nascimento'
          buttonText='Confirmar'
          transparent
          date={date ?? new Date()}
          setDate={setDate}
          modalIsVisible={modalVisibleDate}
          onChangeVisible={() => {
            setModalVisibleDate(!modalVisibleDate)
          }}
          loading={false}
        />
        <ModalInfo
          transparent
          loading={false}
          modalIsVisible={modalVisible}
          title={''}
          onChangeVisible={() => {
            setModalVisible(false)
            if (icon) {
              navigation.goBack()
            }
          }}
          message={textModal}
          buttonText='Entendi'
          icon={icon ? 'success' : 'error'}
          hiddenBorder
        />
        <ModalInfo
          transparent
          loading={false}
          modalIsVisible={modalDelete}
          onChangeVisible={() => {
            setModalDelete(false)
          }}
          closeButton={() => {
            setModalDelete(false)
          }}
          message='Essa ação é irreversível, você tem certeza?'
          buttonText='Não, Continuar'
          secondButtonText='Sim, Quero Cancelar'
          title='Cancelar Cadastro'
          actionSecond={() => {
            navigation.goBack()
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
          message={textModal}
          buttonText='Voltar'
          icon='success'
          // icon={icon ? 'success' : 'error'}
        />
      </Container>
    </KeyboardAwareScrollView>
  )
}
