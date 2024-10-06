import React, { useCallback, useEffect, useState } from 'react'

import { useTheme } from 'styled-components'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { ActivityIndicator, View } from 'react-native'
import { Container } from './styles'
import { useFocusEffect } from '@react-navigation/native'

import NetInfo from '@react-native-community/netinfo'
import axios, { AxiosRequestConfig } from 'axios'
import useKeyboardHook from '~/hooks/KeyboardOpen'
import ModalInfo from '~/components/ModalInfo'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import ModalNewCity from './components/ModalNewCity'
import { normalize } from '~/utils'
import { Button } from '~/components/Button'
import ModalCities from './components/ModalCities'
import { Label } from '~/components/Label/variants'
import api from '~/services/api'
import { TOKEN } from '@env'

export const FavoriteCities = () => {
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }
  const theme = useTheme()
  const { isOpen } = useKeyboardHook()

  const [textModal, setTextModal] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [icon, setIcon] = useState(false)
  const [modalNewCity, setModalNewCity] = useState(false)

  const [modalCities, setModalCities] = useState(false)

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

  const schema = yup.object().shape({
    state: yup.string().required(),
    city: yup.string().required(),
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      state: '',
      city: '',
    },
  })

  const onSubmit = async (data: { state: string; city: string }) => {
    try {
      setLoading(true)

      const storedData = await AsyncStorage.getItem('dataList')

      let dataList = []

      if (storedData) {
        dataList = JSON.parse(storedData)
      }

      const city = {
        city: cities.find((it) => it.text === data.city)?.text,
        id: cities.find((it) => it.text === data.city)?.value,
      }

      const exists = dataList.some(
        (item: any) => item.state === data.state && item.city === city.city && item.id === city.id
      )
      console.log({ ...city, state: data.state })
      if (!exists) {
        dataList.push({ ...city, state: data.state })
        await AsyncStorage.setItem('dataList', JSON.stringify(dataList))
      }
      setModalNewCity(false)
      setModalVisible(true)

      setTextModal('Operação bem sucedida')
      setIcon(true)

      setLoading(false)
    } catch (er: any) {
      console.log({ ...er })
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
      if (state && state.length && hasConnection) {
        const { data } = await api.get(`vxappcidades/${state}`, config)
        setCities(
          data.map((it: { id: number; nome: string }) => {
            return {
              value: it.id,
              text: it.nome,
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
      <HeaderSecondary title='Ativação' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary title='Cidades favoritas' />
      <Container>
        <View
          style={{
            width: '100%',
          }}
        >
          <Label textAlign='left' fontSize={20} lineHeight={30} marginBottom={14}>
            Adicione as principais cidades que você opera e facilite as suas ativações.
          </Label>
          <Label textAlign='left' color='#707173' fontSize={16} lineHeight={24} marginBottom={34}>
            Seus favoritos são importantes caso você esteja trabalhando sem internet. Assim suas
            ativações não são impedidas pela falta de conexão.
          </Label>
        </View>
        <View
          style={{
            width: '100%',
            marginBottom: 40,
          }}
        >
          <Button
            text='Lista de cidades favoritas'
            onPress={() => setModalCities(true)}
            color={theme.COLORS.SECONDARY_400}
          />
        </View>
        <View
          style={{
            width: '100%',
          }}
        >
          <Button
            text='Cadastar cidade favorita'
            onPress={() => setModalNewCity(true)}
            color={theme.COLORS.SECONDARY_400}
          />
        </View>
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
      <ModalCities
        transparent
        modalIsVisible={modalCities}
        onChangeVisible={() => setModalCities(false)}
      />
      <ModalNewCity
        transparent
        message=''
        modalIsVisible={modalNewCity}
        hasConnection={hasConnection}
        trigger={trigger}
        control={control}
        setValue={setValue}
        setState={setState}
        errors={errors}
        state={state}
        states={states}
        cities={cities}
        getValues={getValues}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        loading={loading}
        onChangeVisible={() => setModalNewCity(false)}
      />
    </KeyboardAwareScrollView>
  )
}
