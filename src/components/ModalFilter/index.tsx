import React, { useEffect, useMemo, useState, useTransition } from 'react'
import {
  ActivityIndicator,
  Modal as ModalNative,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Container, ContainerInput, Content } from './styles'
import { useTheme } from 'styled-components'
import { Label } from '~/components/Label/variants'
import { Button } from '../Button'
import { IconStyled } from '~/screens/Home/styles'
import { Line } from '../Containers/styles'
import { Controller, useForm } from 'react-hook-form'
import { Input } from '../Input'
import CurrencyInput from 'react-native-currency-input'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import ModalDate from '../ModalDate'
import { format } from 'date-fns'
import { RFValue } from 'react-native-responsive-fontsize'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

export type IFilter = {
  startAt?: string
  endAt?: string
  minPrice?: string
  maxPrice?: string
}

interface IModalText {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
  message: string
  loading: boolean
  buttonText?: string
  secondButtonText?: string
  actionSecond?: () => void
  hasButtonCpf?: boolean
  title?: string
  closeButton?: () => void
  filter?: IFilter
  setFilters?: React.Dispatch<React.SetStateAction<IFilter | undefined>>
}

export default function ModalFilter({
  onChangeVisible,
  transparent,
  modalIsVisible,
  loading,
  buttonText,
  secondButtonText,
  actionSecond,
  title,
  closeButton,
  filter,
  setFilters,
}: IModalText) {
  const theme = useTheme()
  const [data, setData] = useState({
    startAt: filter?.startAt ?? '',
    endAt: filter?.endAt ?? '',
    minPrice: filter?.minPrice ?? '',
    maxPrice: filter?.maxPrice ?? '',
  })
  const [date, setDate] = useState<Date>()
  const [modalVisibleDate, setModalVisibleDate] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [dateEnd, setDateEnd] = useState<Date>()
  const [modalVisibleDateEnd, setModalVisibleDateEnd] = useState(false)
  const [showPickerEnd, setShowPickerEnd] = useState(false)

  const { i18n } = useTransition()

  const schema = useMemo(() => {
    return yup.object().shape({
      startAt: yup.string(),
      endAt: yup.string(),
      minPrice: yup.string(),
      maxPrice: yup.string(),
    })
  }, [])

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
      startAt: filter?.startAt ?? '',
      endAt: filter?.endAt ?? '',
      minPrice: filter?.minPrice ?? '',
      maxPrice: filter?.maxPrice ?? '',
    },
  })

  useEffect(() => {
    if (filter) {
      setValue('startAt', filter.startAt)
      setValue('endAt', filter.endAt)
      setValue('minPrice', filter?.minPrice ?? '0')
      setValue('maxPrice', filter?.maxPrice ?? '0')
    }
  }, [filter])

  const onSubmit = async (data: IFilter) => {
    if (setFilters) setFilters(data)
    onChangeVisible()
  }

  const onChange = (event: DateTimePickerEvent, selectedDate: any) => {
    const currentDate = selectedDate
    setDate(currentDate)
    setValue('startAt', format(currentDate, 'yyyy-MM-dd HH:mm:ss'))
    setShowPicker(false)
  }

  const onChangeEnd = (event: DateTimePickerEvent, selectedDate: any) => {
    const currentDate = selectedDate
    setDateEnd(currentDate)
    setValue('endAt', format(currentDate, 'yyyy-MM-dd HH:mm'))
    setShowPickerEnd(false)
  }

  useEffect(() => {
    if (date) {
      setValue('startAt', format(date ?? new Date(), 'yyyy-MM-dd HH:mm'))
      trigger('startAt')
    }
    if (dateEnd) {
      setValue('endAt', format(dateEnd ?? new Date(), 'yyyy-MM-dd HH:mm'))
      trigger('endAt')
    }
  }, [date, dateEnd])

  return (
    <ModalNative
      animationType='fade'
      transparent={transparent}
      visible={modalIsVisible}
      onRequestClose={onChangeVisible}
    >
      <SafeAreaView
        style={{
          flex: 1,
          paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() + 30 : 0,
        }}
      >
        <View
          style={{
            backgroundColor: '#0008',
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: '100%',
              height: loading ? 200 : '100%',
            }}
          >
            <Container>
              {loading ? (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
                  <Label
                    isBold
                    lineHeight={19}
                    fontSize={13}
                    textAlign={'center'}
                    style={{ marginTop: 32 }}
                    isMedium
                  >
                    Carregando...
                  </Label>
                </ScrollView>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <Label
                      isBold
                      lineHeight={29}
                      fontSize={20}
                      textAlign={'left'}
                      style={{ width: '100%' }}
                    >
                      {title}
                    </Label>
                    <TouchableOpacity
                      onPress={() => {
                        if (closeButton) {
                          closeButton()
                          return
                        }
                        onChangeVisible()
                      }}
                      style={{
                        position: 'absolute',
                        right: 0,
                      }}
                    >
                      <IconStyled size={30} name='close' />
                    </TouchableOpacity>
                  </View>

                  <Content>
                    <Line marginTop={20}>
                      <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                        Data Inicial
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
                          {date ? `${format(date, 'dd/MM/yyyy')}` : 'Selecione a data inicial'}
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
                    <Line marginTop={20}>
                      <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                        Data Final
                      </Label>
                    </Line>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'android') {
                          setShowPickerEnd(true)
                          return
                        }
                        setModalVisibleDateEnd(!modalVisibleDateEnd)
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
                          color={dateEnd ? theme.COLORS.TITLE : theme.COLORS.GRAY_04}
                        >
                          {dateEnd ? `${format(dateEnd, 'dd/MM/yyyy')}` : 'Selecione a data final'}
                        </Label>
                        {/* <IconDark name='calendar-blank' size={20} /> */}
                      </ContainerInput>
                    </TouchableOpacity>
                    {showPickerEnd && (
                      <DateTimePicker
                        testID='dateTimePicker'
                        value={dateEnd ?? new Date()}
                        mode='date'
                        onChange={onChangeEnd}
                        display='inline'
                        locale='pt-BR'
                        maximumDate={new Date()}
                        minimumDate={date ?? undefined}
                        style={{
                          backgroundColor: 'white',
                          flex: 1,
                          alignSelf: 'flex-start',
                          borderRadius: RFValue(8),
                        }}
                        themeVariant='light'
                      />
                    )}
                    <Line marginTop={20}>
                      <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                        Preço Mínimo
                      </Label>
                    </Line>
                    <Controller
                      control={control}
                      name='minPrice'
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CurrencyInput
                          value={Number(value)}
                          onChangeValue={(e) => {
                            onChange(e ? `${e}` : '0')
                            setData((stt) => ({ ...stt, minPrice: e ? `${e}` : '0' }))
                          }}
                          renderTextInput={(textInputProps) => (
                            <Input
                              {...textInputProps}
                              error={!!errors?.minPrice}
                              keyboardType='numeric'
                              hasValidation
                            />
                          )}
                          prefix='R$'
                          delimiter='.'
                          separator=','
                          precision={2}
                        />
                      )}
                    />

                    <Line marginTop={20}>
                      <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                        Preço Máximo
                      </Label>
                    </Line>
                    <Controller
                      control={control}
                      name='maxPrice'
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CurrencyInput
                          value={Number(value)}
                          onChangeValue={(e) => {
                            onChange(e ? `${e}` : '0')
                            setData((stt) => ({ ...stt, maxPrice: e ? `${e}` : '0' }))
                          }}
                          renderTextInput={(textInputProps) => (
                            <Input
                              {...textInputProps}
                              error={!!errors?.maxPrice}
                              keyboardType='numeric'
                              hasValidation
                            />
                          )}
                          prefix='R$'
                          delimiter='.'
                          separator=','
                          precision={2}
                        />
                      )}
                    />

                    {secondButtonText ? (
                      <View
                        style={{
                          marginTop: 'auto',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Button
                          text={buttonText ?? 'Ok'}
                          onPress={onChangeVisible}
                          color={theme.COLORS.WHITE}
                          textColor={theme.COLORS.SECONDARY_900}
                          border={theme.COLORS.SECONDARY_900}
                        />
                        <View style={{ marginTop: 8 }} />
                        <Button
                          text={secondButtonText ?? 'Ok'}
                          onPress={actionSecond}
                          color={theme.COLORS.WHITE}
                          textColor={theme.COLORS.SECONDARY_900}
                        />
                      </View>
                    ) : (
                      <View style={{ marginTop: 'auto' }}>
                        <Button
                          text={buttonText ?? 'Ok'}
                          onPress={handleSubmit(onSubmit)}
                          color={theme.COLORS.SECONDARY_900}
                          textColor={theme.COLORS.WHITE}
                          border={theme.COLORS.SECONDARY_900}
                          disabled={
                            (!getValues('startAt') &&
                              !getValues('endAt') &&
                              !getValues('minPrice') &&
                              !getValues('maxPrice')) ||
                            loading
                          }
                        />
                      </View>
                    )}
                  </Content>
                </>
              )}
            </Container>
          </View>
        </View>
        <ModalDate
          message='Data Inicial'
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
        <ModalDate
          message='Data Final'
          buttonText='Confirmar'
          transparent
          date={dateEnd ?? new Date()}
          setDate={setDateEnd}
          modalIsVisible={modalVisibleDateEnd}
          onChangeVisible={() => {
            setModalVisibleDateEnd(!modalVisibleDateEnd)
          }}
          loading={false}
        />
      </SafeAreaView>
    </ModalNative>
  )
}
