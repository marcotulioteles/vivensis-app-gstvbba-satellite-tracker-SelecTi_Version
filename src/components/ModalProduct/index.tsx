import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal as ModalNative,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Container, Content } from './styles'
import { useTheme } from 'styled-components'
import { Label } from '~/components/Label/variants'
import { Button } from '../Button'
import { IconStyled } from '~/screens/Home/styles'
import { Line } from '../Containers/styles'
import { Controller, useForm } from 'react-hook-form'
import { InputButton } from '../InputButton'
import { Input } from '../Input'
import CurrencyInput from 'react-native-currency-input'
import { Budget, Product } from '~/screens/BudgetNew'
import { extractCod } from '~/utils'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import useKeyboardHook from '~/hooks/KeyboardOpen'
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
  setBudgets: React.Dispatch<React.SetStateAction<Budget | undefined>>
  budgets: Budget | undefined
  products: { value: number; text: string; image: string; type?: 'I' | 'F'; description?: string }[]
  productEdit?: Product
}

export default function ModalProduct({
  onChangeVisible,
  transparent,
  modalIsVisible,
  loading,
  buttonText,
  secondButtonText,
  actionSecond,
  hasButtonCpf,
  title,
  closeButton,
  products,
  setBudgets,
  budgets,
  productEdit,
}: IModalText) {
  const theme = useTheme()
  const [data, setData] = useState({
    quantity: productEdit?.quantity ?? '',
    price: productEdit?.price ?? '',
    name: productEdit?.quantity ?? '',
    description: productEdit?.description ?? '',
  })

  const { isOpen } = useKeyboardHook()
  const [focus, setFocus] = useState(false)

  const schema = useMemo(() => {
    return yup.object().shape({
      name: yup.string().required(),
      quantity: yup.string().required(),
      price: yup.string().required(),
      description: yup.string(),
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
      quantity: productEdit?.quantity ?? '',
      price: productEdit?.price ?? '',
      name: productEdit ? `${productEdit.name} - COD: ${productEdit.id}` : '',
      description: productEdit?.description ?? '',
    },
  })

  useEffect(() => {
    if (productEdit) {
      setValue('name', productEdit ? `${productEdit.name} - COD: ${productEdit.id}` : '')
      setValue('quantity', productEdit.quantity)
      setValue('price', productEdit.price)
      setValue('description', productEdit?.description ?? '')
    }
  }, [productEdit])

  function findProductByCod(cod: number) {
    return products.find((product) => product.value === cod)
  }

  const onSubmit = async (data: Product) => {
    if (
      Number(getValues('price') ?? 0) === 0 ||
      Number(getValues('quantity') ?? 0) === 0 ||
      !getValues('name') ||
      !getValues('price') ||
      !getValues('quantity') ||
      getValues('price') === 'null' ||
      loading
    ) {
      return
    }
    if (!data?.name || !data?.price || !data?.quantity || data?.price === 'null') {
      return
    }
    if (productEdit) {
      const newProduct = findProductByCod(Number(extractCod(data.name)))
      if (budgets?.products) {
        const newProducts = budgets.products.map((product) => {
          if (product.id === productEdit.id) {
            return {
              ...product,
              name: newProduct?.text ?? '',
              id: `${newProduct?.value}`,
              price: data.price,
              quantity: data.quantity,
              image: newProduct?.image ?? '',
              type: newProduct?.type,
              description: data?.description ?? '',
            }
          }
          return product
        })
        setBudgets({
          ...budgets,
          products: newProducts,
        })
      }
      setValue('name', '')
      setValue('quantity', '')
      setValue('price', '')
      setValue('description', '')
      onChangeVisible()
      return
    }

    const newProduct = findProductByCod(Number(extractCod(data.name)))
    if (budgets?.products) {
      setBudgets({
        ...budgets,
        products: [
          ...budgets.products,
          {
            name: newProduct?.text ?? '',
            id: `${newProduct?.value}`,
            price: data.price,
            quantity: data.quantity,
            image: newProduct?.image ?? '',
            type: newProduct?.type,
            description: data?.description,
          },
        ],
      })
    } else {
      setBudgets((stt: any) => {
        if (stt) {
          return {
            ...stt,
            products: [
              {
                name: newProduct?.text ?? '',
                id: `${newProduct?.value ?? ''}`,
                price: data.price,
                quantity: data.quantity,
                image: newProduct?.image ?? '',
                type: newProduct?.type ?? '',
                description: data?.description,
              },
            ],
          }
        }
        return {
          name: '',
          products: [
            {
              name: newProduct?.text ?? '',
              id: `${newProduct?.value ?? ''}`,
              price: data.price,
              quantity: data.quantity,
              image: newProduct?.image ?? '',
              type: newProduct?.type ?? '',
              description: data?.description,
            },
          ],
        }
      })
    }
    setValue('name', '')
    setValue('quantity', '')
    setValue('price', '')
    setValue('description', '')
    onChangeVisible()
  }

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
                <View
                  style={{
                    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() + 30 : 0,
                    flex: 1,
                  }}
                >
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
                    <Line marginTop={4}>
                      <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                        Equipamento
                      </Label>
                    </Line>
                    <Controller
                      control={control}
                      name='name'
                      render={({ field: { onChange, onBlur, value } }) => (
                        <InputButton
                          placeholder={'Selecine um Equipamento'}
                          accessibilityLabel={'Selecine um Equipamento'}
                          testID='name'
                          defaultValue=''
                          hasFilter
                          value={value}
                          hasValidation
                          editable
                          autoCorrect={false}
                          onBlur={() => {
                            onBlur()
                            trigger('name')
                          }}
                          setState={(e) => {
                            onChange(e as string)
                            trigger('name')
                            setData((stt) => ({ ...stt, name: e as string, quantity: '' }))
                            setValue('quantity', '')
                          }}
                          autoCapitalize='none'
                          error={!!errors?.name}
                          label='Cidade'
                          options={products.map((it) => {
                            return {
                              key: `${it.value}`,
                              name: `${it.text} - COD: ${it.value}`,
                            }
                          })}
                          message='Equipamento'
                        />
                      )}
                    />
                    <Line marginTop={20}>
                      <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                        Quantidade
                      </Label>
                    </Line>
                    <Controller
                      control={control}
                      name='quantity'
                      render={({ field: { onChange, onBlur, value } }) =>
                        findProductByCod(Number(extractCod(data.name)))?.type === 'I' ? (
                          <Input
                            placeholder={'Informe a quantidade'}
                            accessibilityLabel={'Informe a quantidade'}
                            testID='quantity'
                            defaultValue=''
                            value={value}
                            hasValidation
                            autoCorrect={false}
                            keyboardType='numeric'
                            onFocus={() => {
                              setFocus(true)
                            }}
                            onBlur={() => {
                              onBlur()
                              trigger('quantity')
                              setFocus(false)
                            }}
                            onChangeText={(e) => {
                              const filteredValue = e.replace(/[^0-9]/g, '')

                              if (filteredValue.length > 0) {
                                const numValue = Number(filteredValue)
                                const safeValue = numValue > 999 ? '999' : filteredValue
                                onChange(safeValue)
                                setData((stt) => ({ ...stt, quantity: safeValue }))
                              } else {
                                onChange('')
                                setData((stt) => ({ ...stt, quantity: '' }))
                              }
                              trigger('quantity')
                            }}
                            error={!!errors?.quantity}
                            label='Quantidade'
                          />
                        ) : (
                          <CurrencyInput
                            value={Number(value)}
                            onChangeValue={(e) => {
                              const newValue = e ? `${e}` : '0'
                              if (parseFloat(newValue) >= 0) {
                                onChange(newValue)
                                setData((stt) => ({ ...stt, quantity: newValue }))
                              }
                            }}
                            renderTextInput={(textInputProps) => (
                              <Input
                                {...textInputProps}
                                error={!!errors?.price}
                                keyboardType='numeric'
                                hasValidation
                              />
                            )}
                            prefix=''
                            delimiter='.'
                            separator=','
                            precision={2}
                            onFocus={() => {
                              setFocus(true)
                            }}
                            onBlur={() => setFocus(false)}
                          />
                        )
                      }
                    />

                    <Line marginTop={20}>
                      <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                        Valor
                      </Label>
                    </Line>
                    <Controller
                      control={control}
                      name='price'
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CurrencyInput
                          value={Number(value)}
                          onChangeValue={(e) => {
                            const newValue = e ? `${e}` : '0'
                            if (parseFloat(newValue) >= 0) {
                              onChange(newValue)
                              setData((stt) => ({ ...stt, price: newValue }))
                            }
                          }}
                          renderTextInput={(textInputProps) => (
                            <Input
                              {...textInputProps}
                              error={!!errors?.price}
                              keyboardType='numeric'
                              hasValidation
                            />
                          )}
                          prefix='R$'
                          delimiter='.'
                          separator=','
                          precision={2}
                          onFocus={() => {
                            setFocus(true)
                          }}
                          onBlur={() => setFocus(false)}
                        />
                      )}
                    />
                    <Line marginTop={20}>
                      <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
                        Descrição
                      </Label>
                    </Line>
                    <Controller
                      control={control}
                      name='description'
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          placeholder={'Informe a descrição'}
                          accessibilityLabel={'Informe a descrição'}
                          testID='description'
                          defaultValue=''
                          value={value}
                          hasValidation
                          isBigger
                          autoCorrect={false}
                          numberOfLines={3}
                          maxLength={100}
                          multiline
                          onFocus={() => {
                            setFocus(true)
                          }}
                          onBlur={() => {
                            onBlur()
                            trigger('description')
                            setFocus(false)
                          }}
                          onChangeText={(e) => {
                            setData((stt) => ({ ...stt, description: e }))
                            onChange(e)
                            trigger('description')
                          }}
                          error={!!errors?.description}
                          label='Descrição'
                        />
                      )}
                    />
                    <Line marginTop={20}>
                      <Label
                        fontSize={14}
                        isMedium
                        textAlign='left'
                        color={theme.COLORS.PRIMARY_500}
                      >
                        Valor Total
                      </Label>
                    </Line>
                    {data?.price && data?.quantity && data?.name ? (
                      <Line marginTop={20}>
                        <View style={{ width: '30%' }}>
                          <Label textAlign='left' color={theme.COLORS.DARK_GRAY} fontSize={16}>
                            {data?.quantity ?? 0} unidade
                            {`${Number(data?.quantity ?? 0) > 1 ? 's' : ''}`}
                          </Label>
                        </View>
                        <Label color='#000' isBold fontSize={16}>
                          {(Number(data?.quantity ?? 0) * Number(data?.price ?? 0)).toLocaleString(
                            'pt-BR',
                            {
                              style: 'currency',
                              currency: 'BRL',
                            }
                          )}
                        </Label>
                      </Line>
                    ) : (
                      <Label
                        fontSize={14}
                        textAlign='left'
                        color={theme.COLORS.DARK_GRAY}
                        marginTop={12}
                      >
                        Selecione o equipamento e o preço para calcular
                      </Label>
                    )}

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
                      <View style={{ marginTop: isOpen || focus ? 50 : 'auto' }}>
                        <Button
                          text={buttonText ?? 'Ok'}
                          onPress={handleSubmit(onSubmit)}
                          color={theme.COLORS.SECONDARY_900}
                          textColor={theme.COLORS.WHITE}
                          border={theme.COLORS.SECONDARY_900}
                          disabled={
                            Number(getValues('price') ?? 0) === 0 ||
                            Number(getValues('quantity') ?? 0) === 0 ||
                            !getValues('name') ||
                            !getValues('price') ||
                            !getValues('quantity') ||
                            getValues('price') === 'null' ||
                            loading
                          }
                        />
                      </View>
                    )}
                  </Content>
                </View>
              )}
            </Container>
          </View>
        </View>
      </SafeAreaView>
    </ModalNative>
  )
}
