import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from 'styled-components'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, View } from 'react-native'
import { Container } from './styles'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants'

import NetInfo from '@react-native-community/netinfo'
import { Line } from '~/components/Containers/styles'
import { InputButton } from '~/components/InputButton'
import axios, { AxiosRequestConfig } from 'axios'
import useKeyboardHook from '~/hooks/KeyboardOpen'
import api from '~/services/api'
import { TOKEN } from '@env'
import ModalInfo from '~/components/ModalInfo'
import { HeaderSecondary } from '~/components/HeaderSecondary'

export const AntennaSize = () => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }

  const theme = useTheme()
  const { isOpen } = useKeyboardHook()
  const navigation = useNavigation()

  const [textModal, setTextModal] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [icon, setIcon] = useState(false)

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
  const [valueToShow, setValueToShow] = useState<{
    antena_b1: number
    antena_d2: number
    cidade: string
    ibge: number
    uf: string
  }>()

  const schema = useMemo(() => {
    return yup.object().shape({
      state: hasCitieSave ? yup.string() : yup.string().required(),
      city: yup.string().required(),
    })
  }, [hasCitieSave])

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      state: '',
      city: '',
    },
  })

  const confirmSubmit = async (data: { state?: string; city: string }) => {
    try {
      setLoading(true)
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }

      const respAntenna = await api.get(
        `vx10tamanhoantena/${cities.find((it) => it.text === data.city)?.value}`,
        config
      )

      setValueToShow(respAntenna.data)
      setLoading(false)
    } catch (er: any) {
      console.log(er.response.data)
      setTextModal(er.response?.data?.mensagem || '')
      setIcon(false)
      if (er.response?.status === 500) {
        setTextModal('Houve um erro interno')
      }

      setLoading(false)
      setModalVisible(true)
    }
  }

  const onSubmit = async (data: { cpf?: string; state?: string; city: string }) => {
    confirmSubmit(data)
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
      if (state && state.length && hasConnection) {
        if (!dataList.length) {
          const { data } = await api.get(`vxappcidades/${state}`, config)
          setCities(
            data.map((it: { id: number; nome: string }) => {
              return {
                value: it.id,
                text: it.nome,
              }
            })
          )
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

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Tamanho da Antena' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary title='Tamanho da Antena' />
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

        {valueToShow && (
          <>
            <Line marginTop={32}>
              <Label
                fontSize={24}
                lineHeight={30}
                isBold
                textAlign='left'
                color={theme.COLORS.PRIMARY_500}
              >
                Tamanhos Sugeridos
              </Label>
            </Line>

            <Line marginTop={32}>
              <Label fontSize={16} lineHeight={25} textAlign='left' color={theme.COLORS.TITLE}>
                <Label
                  fontSize={16}
                  lineHeight={25}
                  textAlign='left'
                  color={theme.COLORS.DARK_GRAY}
                >
                  Antena KU D2
                </Label>
                {'          '}
                {valueToShow?.antena_d2}m
              </Label>
            </Line>
            <Line
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.COLORS.GRAY_03,
                paddingTop: 16,
              }}
              marginTop={16}
            >
              <Label fontSize={16} lineHeight={25} textAlign='left' color={theme.COLORS.TITLE}>
                <Label
                  fontSize={16}
                  lineHeight={25}
                  textAlign='left'
                  color={theme.COLORS.DARK_GRAY}
                >
                  Antena KU B1
                </Label>
                {'         '}
                {valueToShow?.antena_b1}m
              </Label>
            </Line>
          </>
        )}

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
              text={valueToShow ? 'Consultar' : 'Nova Consulta'}
              disabled={!hasConnection || !getValues('city')}
              onPress={handleSubmit(onSubmit)}
              color={theme.COLORS.SECONDARY_400}
            />
            <View style={{ marginTop: 16 }}></View>
            {valueToShow && (
              <Button
                text='Fechar'
                disabled={!hasConnection || !getValues('city')}
                onPress={() => navigation.goBack()}
                textColor={theme.COLORS.SECONDARY_400}
                color={theme.COLORS.SHAPE}
              />
            )}
          </View>
        )}
      </Container>

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalVisible}
        onChangeVisible={() => setModalVisible(false)}
        message={textModal}
        buttonText='Entendi'
        icon={icon ? 'success' : 'error'}
      />
    </KeyboardAwareScrollView>
  )
}
