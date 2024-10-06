import React from 'react'
import { ActivityIndicator, Modal as ModalNative, ScrollView, View } from 'react-native'
import { Container } from './styles'
import { useTheme } from 'styled-components'
import { Label } from '~/components/Label/variants'
import { Button } from '../Button'

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { RFValue } from 'react-native-responsive-fontsize'

interface IModalText {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
  message: string
  loading: boolean
  buttonText?: string
  date: Date
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
}

export default function ModalDate({
  onChangeVisible,
  transparent,
  modalIsVisible,
  date,
  loading,
  buttonText,
  setDate,
}: IModalText) {
  const theme = useTheme()
  const onChange = (event: DateTimePickerEvent, selectedDate: any) => {
    const currentDate = new Date(selectedDate)
    currentDate.setHours(
      23,
      currentDate.getMinutes(),
      currentDate.getSeconds(),
      currentDate.getMilliseconds()
    )
    setDate(currentDate ?? new Date())
  }

  return (
    <ModalNative
      animationType='fade'
      transparent={transparent}
      visible={modalIsVisible}
      onRequestClose={onChangeVisible}
    >
      <View
        style={{
          backgroundColor: '#0008',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '90%',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            minHeight: loading ? 200 : 440,
            borderRadius: 16,
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
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flex: 1 }}
              >
                <DateTimePicker
                  testID='dateTimePicker'
                  value={date}
                  mode='date'
                  onChange={onChange}
                  display='inline'
                  locale='pt-BR'
                  dayOfWeekFormat={'{dayofweek.abbreviated(2)}'}
                  maximumDate={
                    new Date(
                      new Date().setHours(
                        new Date().getHours() + 3,
                        new Date().getMinutes(),
                        new Date().getSeconds(),
                        new Date().getMilliseconds()
                      )
                    )
                  }
                  style={{
                    backgroundColor: 'white',
                    flex: 1,
                    alignSelf: 'center',
                    borderRadius: RFValue(8),
                    maxWidth: '90%',
                  }}
                  themeVariant='light'
                />
                <View style={{ marginTop: 'auto' }}>
                  <Button text={buttonText ? buttonText : 'Ok'} onPress={onChangeVisible} />
                </View>
              </ScrollView>
            )}
          </Container>
        </View>
      </View>
    </ModalNative>
  )
}
