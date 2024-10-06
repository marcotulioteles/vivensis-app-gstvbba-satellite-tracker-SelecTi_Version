import React, { useCallback, useEffect, useState } from 'react'

import { useTheme } from 'styled-components'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ActivityIndicator, View } from 'react-native'
import { Header } from '~/components/Header'
import { Container } from './styles'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants'

import NetInfo from '@react-native-community/netinfo'
import { Line } from '~/components/Containers/styles'
import { AxiosRequestConfig } from 'axios'
import { Input } from '~/components/Input'
import ModalQrcode from '~/components/ModalQrcode'
import useKeyboardHook from '~/hooks/KeyboardOpen'
import api from '~/services/api'
import { TOKEN } from '@env'
import ModalInfo from '~/components/ModalInfo'
import { IconStyled } from '../Home/styles'
import { TouchableOpacity } from 'react-native'
import { HeaderSecondary } from '~/components/HeaderSecondary'

export const Signal = () => {
  const theme = useTheme()
  const { isOpen } = useKeyboardHook()

  const navigation = useNavigation()

  const [textModal, setTextModal] = useState('')
  const [modalQrcode, setShowModalQrcode] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [icon, setIcon] = useState(false)
  const [data, setData] = useState({
    scua: '',
    caid: '',
  })
  const [showInfo, setShowInfo] = useState(false)

  const [loading, setLoading] = useState(true)
  const [hasConnection, setHasConnection] = useState(false)

  const schema = yup.object().shape({
    caid: yup.string().required(),
    scua: yup.string().required(),
  })

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      caid: '',
      scua: '',
    },
  })

  function comecaComT(str: string): boolean {
    return str.startsWith('T')
  }

  const onSubmit = async (data: { caid: string; scua: string }) => {
    if (!hasConnection || !getValues('caid') || !getValues('scua')) return
    setLoading(true)
    try {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
      const respData = await api.post(
        'vx10reforco',
        {
          caid: data.caid,
          scid: data.scua,
          origem: 'VXAPP',
        },
        config
      )
      if (respData.data?.resp && respData.data?.resp === 'N') {
        setTextModal('Falha no reforço de sinal')
        setIcon(false)
        setModalVisible(true)
        setLoading(false)
        setShowInfo(false)
        return
      }
      setTextModal('Operação bem sucedida')
      setModalVisible(true)
      setIcon(true)
      setLoading(false)
      setValue('caid', '')
      setValue('scua', '')

      if (!comecaComT(data.caid)) {
        setShowInfo(true)
      }
    } catch (er: any) {
      setTextModal(er.response?.data)
      setModalVisible(true)
      setIcon(false)
      if (er.response.status === 500) {
        setTextModal('Houve um erro interno')
      }
      if (er.response.status === 404) {
        setTextModal('O CAID/SCID não foi encontrado')
      }
      setShowInfo(false)
      setLoading(false)
    }
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
    if (data?.caid || data?.scua) {
      setValue('caid', data?.caid || '')
      setValue('scua', data?.scua || '')
      trigger('caid')
      trigger('scua')
    }
  }, [data])

  function handleError(message: string) {
    setTextModal(message)
    setIcon(false)
    setModalVisible(true)
  }

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Reforço de Sinal' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary title='Reforço de Sinal' />
      <Container>
        <Line marginTop={20}>
          <TouchableOpacity
            onPress={() => setShowModalQrcode(true)}
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
              }}
              error={!!errors?.scua}
              label='SCUA'
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
            {showInfo && (
              <Label marginBottom={24}>
                Atenção! Após ativação, receptores com Antena KU B1 podem levar até 72 horas para
                serem registrados em nossos canais.
              </Label>
            )}
            <Button
              text='Solicitar Reforço'
              disabled={!hasConnection || !getValues('caid') || !getValues('scua')}
              onPress={handleSubmit(onSubmit)}
              color={theme.COLORS.SECONDARY_400}
            />
          </View>
        )}
      </Container>
      <ModalQrcode
        transparent
        modalIsVisible={modalQrcode}
        onChangeVisible={() => setShowModalQrcode(false)}
        setData={setData}
        handleError={handleError}
      />

      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalVisible}
        onChangeVisible={() => {
          setModalVisible(false)
          navigation.goBack()
        }}
        message={textModal}
        buttonText='Entendi'
        icon={icon ? 'success' : 'error'}
      />
    </KeyboardAwareScrollView>
  )
}
