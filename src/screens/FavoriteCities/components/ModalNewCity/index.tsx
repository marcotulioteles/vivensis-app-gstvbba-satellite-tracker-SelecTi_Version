import React from 'react'
import { Dimensions, Modal as ModalNative, View } from 'react-native'
import { Container, Content } from './styles'
import { useTheme } from 'styled-components'
import { Label } from '~/components/Label/variants'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { Line } from '~/components/Containers/styles'
import {
  Control,
  Controller,
  FieldErrors,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form'
import { InputButton } from '~/components/InputButton'

interface IModalText {
  onChangeVisible: () => void
  transparent: boolean
  modalIsVisible: boolean
  message: string
  icon?: 'error' | 'success'
  loading: boolean
  buttonText?: string
  hasConnection: boolean
  setValue: UseFormSetValue<{
    state: string
    city: string
  }>
  trigger: UseFormTrigger<{
    state: string
    city: string
  }>
  control: Control<
    {
      state: string
      city: string
    },
    any
  >
  setState: React.Dispatch<React.SetStateAction<string>>
  errors: FieldErrors<{
    state: string
    city: string
  }>
  states: {
    value: string
    text: string
  }[]
  state: string
  cities: {
    value: string
    text: string
  }[]
  getValues: UseFormGetValues<{
    state: string
    city: string
  }>
  handleSubmit: UseFormHandleSubmit<
    {
      state: string
      city: string
    },
    undefined
  >
  onSubmit: (data: { state: string; city: string }) => Promise<void>
}

export default function ModalNewCity({
  onChangeVisible,
  transparent,
  modalIsVisible,
  setValue,
  hasConnection,
  trigger,
  control,
  setState,
  errors,
  states,
  state,
  cities,
  getValues,
  handleSubmit,
  onSubmit,
}: IModalText) {
  const theme = useTheme()

  const handleClose = async () => {
    onChangeVisible()
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
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: Dimensions.get('window').height,
        }}
      >
        <View
          style={{
            width: '100%',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            height: Dimensions.get('window').height,
          }}
        >
          <Container>
            <HeaderSecondary
              title='Nova cidade favorita'
              hasAnotherAction
              handleLeftAction={onChangeVisible}
            />
            <Content>
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
                    autoCorrect={false}
                    onBlur={() => {
                      onBlur()
                      trigger('state')
                    }}
                    editable
                    setState={(e) => {
                      onChange(e as string)
                      setState(e as string)
                      setValue('city', '')
                      trigger('state')
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
                    value={value}
                    hasValidation
                    editable={!!state}
                    autoCorrect={false}
                    hasFilter
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

              <View
                style={{
                  position: 'absolute',
                  bottom: normalize(40),
                  left: normalize(24),
                  width: '100%',
                }}
              >
                <Button
                  text='Salvar'
                  disabled={!hasConnection || !getValues('city') || !getValues('state')}
                  onPress={handleSubmit(onSubmit)}
                  color={theme.COLORS.SECONDARY_400}
                />
              </View>
            </Content>
          </Container>
        </View>
      </View>
    </ModalNative>
  )
}
