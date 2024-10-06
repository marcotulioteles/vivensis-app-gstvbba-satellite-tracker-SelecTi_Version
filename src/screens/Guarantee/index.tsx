import React, { useCallback, useEffect, useState } from 'react'

import { useTheme } from 'styled-components'
import * as FileSystem from 'expo-file-system'
import { Asset } from 'expo-asset'
import * as Sharing from 'expo-sharing'
import { Buffer } from 'buffer'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ActivityIndicator, Dimensions, Platform, View } from 'react-native'
import { Header } from '~/components/Header'
import { Container } from './styles'
import { useFocusEffect } from '@react-navigation/native'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import Pdf from 'react-native-pdf'

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
import { Alert } from 'react-native'
import { BASE_64_BG } from './image/img64'

export const Guarantee = () => {
  const theme = useTheme()
  const { isOpen } = useKeyboardHook()

  const [textModal, setTextModal] = useState('')
  const [modalQrcode, setShowModalQrcode] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [icon, setIcon] = useState(false)
  const [data, setData] = useState({
    scua: '',
    caid: '',
  })
  const [showPdf, setShowPdf] = useState(false)
  const [uriPdf, setUriPdf] = useState('')
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

  async function getBase64Image(imgPath: any) {
    const asset: any = Asset.fromModule(imgPath)

    // Isso garante que o recurso é carregado corretamente
    if (!asset.localUri) {
      await asset.downloadAsync()
    }
    try {
      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      return `data:image/png;base64,${base64}`
    } catch (error) {
      console.error('Error converting image to Base64', `${error}`)
      setTextModal(`${error}`)
      setModalVisible(true)
      return null
    }
  }

  useEffect(() => {
    // setShowPdf(false)
  }, [])

  const sharePDF = async (fileUri: string) => {
    if (!(await Sharing.isAvailableAsync())) {
      alert(`Uh oh, sharing isn't available on your platform`)
      return
    }
    await Sharing.shareAsync(fileUri)
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
      const respData = await api.get(`vx10garantia?caid=${data.caid}&scid=${data.scua}`, config)
      console.log(respData.data)
      if (respData.data?.resp && respData.data?.resp === 'N') {
        setTextModal('Falha ao buscar a garantia')
        setIcon(false)
        setModalVisible(true)
        setLoading(false)
        setShowPdf(false)
        return
      }
      const fileName = `garantee-${respData.data.produto}`
      let options = {
        html: ` <style>
              body {
                width: 1000px;             
                height: 1250px;          
                margin: 0;                
                overflow: hidden;    
                font-family: "DIN Next Arabic Medium", sans-serif;
                page-break-inside: avoid;       
              }
              .container {
                width: 1000px;            
                height: 1250px;     
                page-break-inside: avoid;        
              }
            </style>
            <div class="container">
              <img src="${BASE_64_BG}" width="1000" height="1250" />
              <h3 style="font-family: 'DIN Next Arabic Medium', sans-serif; position: absolute; top: 405px; left: 318px; ">${respData.data.produto}</h3>
              <h3 style="font-family: 'DIN Next Arabic Medium', sans-serif; position: absolute; top: 425px; left: 398px;">${respData.data.dta_habilitacao}</h3>
              <h3 style="font-family: 'DIN Next Arabic Medium', sans-serif; position: absolute; top: 450px; left: 400px;">${respData.data.dta_vcto_garantia}</h3>
              <h3 style="font-family: 'DIN Next Arabic Medium', sans-serif; position: absolute; top: 480px; left: 280px;">${respData.data.caid}</h3>
              <h3 style="font-family: 'DIN Next Arabic Medium', sans-serif; position: absolute; top: 500px; left: 280px;">${respData.data.scid}</h3>
            </div>
          `,
        fileName,
        directory: 'Documents',
        base64: true,
      }

      let file = await RNHTMLtoPDF.convert(options)
      setUriPdf(file.filePath as string)

      const fileUri = FileSystem.documentDirectory + `${fileName}.pdf`
      await FileSystem.writeAsStringAsync(fileUri, file.base64 as string, {
        encoding: FileSystem.EncodingType.Base64,
      })
      sharePDF(fileUri as string)
      // setValue('caid', '')
      // setValue('scua', '')
      setShowPdf(true)
      setLoading(false)
    } catch (er: any) {
      console.log(er)
      // setLoading(false)
      // setTextModal(er?.response?.data || `${er}`)
      setModalVisible(true)
      setIcon(false)
      setShowPdf(false)
      if (er.response.status === 500) {
        setTextModal('Houve um erro interno')
      }
      if (er.response.status === 404 || er.response.status === 400) {
        setTextModal('O CAID/SCID não foi encontrado')
      }
      if (er.response.status !== 404 && er.response.status !== 500 && er.response.status === 400) {
        setTextModal('Nosso sistema está temporariamente indisponível, tente novamente mais tarde.')
      }
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
      <HeaderSecondary title='Garantia' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary
        title='Garantia'
        handleLeftAction={
          showPdf
            ? () => {
                setShowPdf(false)
                setValue('caid', '')
                setValue('scua', '')
              }
            : undefined
        }
        hasAnotherAction={showPdf}
      />
      {showPdf ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: 25,
          }}
        >
          <Pdf
            source={{ uri: uriPdf }}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`)
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`)
            }}
            enablePaging={false}
            onError={(error) => {
              console.log(error)
            }}
            onPressLink={(uri) => {
              console.log(`Link pressed: ${uri}`)
            }}
            style={{
              flex: 1,
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height - 80,
            }}
          />
        </View>
      ) : (
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
              <Button
                text='Gerar PDF'
                disabled={!hasConnection || !getValues('caid') || !getValues('scua')}
                onPress={handleSubmit(onSubmit)}
                color={theme.COLORS.SECONDARY_400}
              />
            </View>
          )}
        </Container>
      )}

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
        onChangeVisible={() => setModalVisible(false)}
        message={textModal}
        buttonText='Entendi'
        icon={icon ? 'success' : 'error'}
      />
    </KeyboardAwareScrollView>
  )
}
