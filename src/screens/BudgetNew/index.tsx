import React, { useEffect, useMemo, useState } from 'react'

import { useTheme } from 'styled-components'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, TouchableOpacity, View, Image, Dimensions } from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Container } from './styles'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants/index'
import ModalInfo from '~/components/ModalInfo'
import { Input } from '~/components/Input'
import { Line } from '~/components/Containers/styles'
import { IconStyled } from '../Home/styles'
import { Controller, useForm } from 'react-hook-form'
import ModalProduct from '~/components/ModalProduct'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { RootBottomTabParamList } from '~/routes'
import api from '~/services/api'
import { AxiosRequestConfig } from 'axios'
import { TOKEN } from '@env'

export interface Product {
  id?: string
  name: string
  price: string
  quantity: string
  image?: string
  type?: 'I' | 'F'
  description?: string
}

export interface Budget {
  name: string
  products: Product[]
  id: number
}

type BudgetNewRouteProp = RouteProp<RootBottomTabParamList, 'BudgetNew'>
export const BudgetNew = () => {
  const theme = useTheme()
  const route = useRoute<BudgetNewRouteProp>()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalVisibleProduct, setModalVisibleProduct] = useState(false)
  const [budgets, setBudgets] = useState<Budget | undefined>(route?.params?.budget ?? undefined)
  const [modalSuccess, setModalSuccess] = useState(false)

  const [techName, setTechName] = useState('')

  const [editProduct, setEditProduct] = useState<Product>()
  const [products, setProducts] = useState<
    {
      value: number
      text: string
      image: string
      type?: 'I' | 'F'
    }[]
  >([])

  const schema = useMemo(() => {
    return yup.object().shape({
      name: yup.string().required(),
      name_tec: yup.string().required(),
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
      name: route?.params?.budget?.name ?? '',
      name_tec: techName,
    },
  })

  const handleSaveBudget = async (data: { name: string; name_tec: string }) => {
    if (!budgets) return
    if (!budgets.products || budgets.products.length === 0) return
    if (!data?.name_tec) return
    setLoading(true)
    await AsyncStorage.setItem('@techName', data.name_tec)
    console.log(data)
    try {
      const budget = {
        ...budgets,
        name: data.name,
        id: String(new Date().getTime()),
      }

      if (route.params?.budget) {
        const budgetsStorage = await AsyncStorage.getItem('@budgetsList')
        if (budgetsStorage) {
          const budgetsParsed = JSON.parse(budgetsStorage)
          const index = budgetsParsed.findIndex(
            (item: Budget) => item.id === route.params.budget?.id
          )
          budgetsParsed[index] = budget
          await AsyncStorage.setItem('@budgetsList', JSON.stringify(budgetsParsed))
        }
        setLoading(false)
        setModalSuccess(true)
        return
      }

      const budgetsStorage = await AsyncStorage.getItem('@budgetsList')
      if (budgetsStorage) {
        const budgetsParsed = JSON.parse(budgetsStorage)
        budgetsParsed.push(budget)
        await AsyncStorage.setItem('@budgetsList', JSON.stringify(budgetsParsed))
      } else {
        await AsyncStorage.setItem('@budgetsList', JSON.stringify([budget]))
      }
      setLoading(false)
      setModalSuccess(true)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadProducts() {
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
      const { data } = await api.get('vxappitensorc', config)
      setProducts(
        data.itens.map(
          (it: { descricao: string; id: number; url: string; tipo_campo: 'I' | 'F' }) => {
            return {
              text: it.descricao,
              value: it.id,
              image: it.url,
              type: it.tipo_campo,
            }
          }
        )
      )
    }
    loadProducts()
  }, [])

  useEffect(() => {
    async function loadTechName() {
      const response = await AsyncStorage.getItem('@techName')
      if (response) {
        setTechName(response)
        setValue('name_tec', response)
      }
    }
    loadTechName()
  }, [])

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Novo Orçamento' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <HeaderSecondary
        title='Novo Orçamento'
        isShare={!!route?.params?.budget}
        action={() => {
          if (budgets) navigation.navigate('PDFBudget', { budget: budgets })
        }}
      />
      <Container>
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Técnico
          </Label>
        </Line>
        <Controller
          control={control}
          name='name_tec'
          rules={{
            validate: async () => {
              return await schema
                .validateAt('name_tec', { name: getValues('name_tec') })
                .then(() => true)
                .catch((error) => error.message)
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Nome do técnico'}
              accessibilityLabel={'Nome do técnico'}
              testID='name_tec'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('name_tec')
              }}
              maxLength={40}
              onChangeText={(e) => {
                setValue('name_tec', e)
                trigger('name_tec')
              }}
              error={!!errors?.name_tec}
              label='Técnico'
              errorText='Nome obrigatório'
            />
          )}
        />
        <Line marginTop={4}>
          <Label fontSize={14} textAlign='left' color={theme.COLORS.PRIMARY_500}>
            Cliente
          </Label>
        </Line>
        <Controller
          control={control}
          name='name'
          rules={{
            validate: async () => {
              return await schema
                .validateAt('name', { name: getValues('name') })
                .then(() => true)
                .catch((error) => error.message)
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={'Nome do cliente'}
              accessibilityLabel={'Nome do cliente'}
              testID='name'
              defaultValue=''
              value={value}
              hasValidation
              autoCorrect={false}
              onBlur={() => {
                onBlur()
                trigger('name')
              }}
              maxLength={40}
              onChangeText={(e) => {
                setValue('name', e)
                trigger('name')
              }}
              error={!!errors?.name}
              label='Cliente'
              errorText='Nome obrigatório'
            />
          )}
        />
        {budgets?.products?.length ? (
          <>
            <Line
              marginTop={12}
              style={{
                paddingBottom: 24,
                borderBottomWidth: 1,
                borderBottomColor: theme.COLORS.GRAY_ICE_GRAY,
              }}
            >
              <Label fontSize={16} isMedium textAlign='left' color={theme.COLORS.PRIMARY_500}>
                Equipamentos
              </Label>
            </Line>
            {budgets?.products.map((product, index) => {
              const val = Number(product.price) * Number(product.quantity) ?? 0
              return (
                <View
                  key={index}
                  style={{
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.COLORS.GRAY_ICE_GRAY,
                  }}
                >
                  <Line style={{ width: '100%' }}>
                    <View style={{}}>
                      <Image
                        resizeMode='contain'
                        source={{
                          uri: `${product.image}`,
                        }}
                        style={{ width: 48, height: 48, borderRadius: 8, marginRight: 8 }}
                      />
                    </View>
                    <View style={{ width: Dimensions.get('window').width - 40 - 66 }}>
                      <Line marginTop={16} isBetween>
                        <View
                          style={{
                            backgroundColor: theme.COLORS.GRAY_ICE_GRAY,
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                          }}
                        >
                          <Label fontSize={14} textAlign='left' color={theme.COLORS.DARK_GRAY}>
                            x {product.quantity}
                          </Label>
                        </View>

                        <Line>
                          <TouchableOpacity
                            onPress={() => {
                              setModalVisibleProduct(true)
                              setEditProduct(product)
                            }}
                          >
                            <IconStyled
                              name='pencil-outline'
                              color={theme.COLORS.DARK_GRAY}
                              size={normalize(18)}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ marginLeft: 8 }}
                            onPress={() => {
                              const newProducts = budgets?.products.filter(
                                (item) => item !== product
                              )
                              setBudgets({ ...budgets, products: newProducts })
                            }}
                          >
                            <IconStyled
                              name='delete-outline'
                              color={theme.COLORS.DARK_GRAY}
                              size={normalize(18)}
                            />
                          </TouchableOpacity>
                        </Line>
                      </Line>
                      <Line marginTop={12} isBetween>
                        <Label
                          style={{ maxWidth: val > 100000 ? 150 : 180 }}
                          fontSize={16}
                          textAlign='left'
                          color={theme.COLORS.TITLE}
                        >
                          {product.name}
                        </Label>
                        <Label
                          fontSize={val > 100000 ? 13 : 16}
                          textAlign='left'
                          color={theme.COLORS.PRIMARY_400}
                        >
                          {val.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </Label>
                      </Line>
                    </View>
                  </Line>
                </View>
              )
            })}
            <Line
              marginTop={12}
              isBetween
              style={{
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.COLORS.GRAY_ICE_GRAY,
              }}
            >
              <Label fontSize={16} textAlign='left' color={theme.COLORS.TITLE}>
                Valor Total
              </Label>
              <Label fontSize={16} textAlign='left' color={theme.COLORS.PRIMARY_400}>
                {budgets?.products
                  .reduce((acc, item) => {
                    acc += Number(item.price) * Number(item.quantity)
                    return acc
                  }, 0)
                  .toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
              </Label>
            </Line>
          </>
        ) : null}

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
            marginBottom: 24,
          }}
          onPress={() => setModalVisibleProduct(true)}
        >
          <IconStyled
            name='plus-circle'
            color={theme.COLORS.SECONDARY_900}
            style={{ marginRight: 8 }}
            size={normalize(18)}
          />
          <Label fontSize={16} isMedium textAlign='left' color={theme.COLORS.SECONDARY_900}>
            Adicionar Item
          </Label>
        </TouchableOpacity>
        <View
          style={{
            width: '100%',
            marginTop: 'auto',
          }}
        >
          <Button
            text='Salvar orçamento'
            onPress={handleSubmit(handleSaveBudget)}
            color={theme.COLORS.SECONDARY_400}
            disabled={
              loading ||
              !budgets ||
              !getValues('name') ||
              !!errors?.name ||
              !getValues('name_tec') ||
              !budgets.products.length
            }
          />
          <View style={{ marginTop: 16 }} />
          <Button
            text={route?.params?.budget ? 'Excluir Orçamento' : 'Cancelar'}
            onPress={() => {
              setModalVisible(true)
            }}
            color={theme.COLORS.SHAPE}
            textColor={theme.COLORS.SECONDARY_400}
          />
        </View>
        <ModalInfo
          transparent
          loading={false}
          modalIsVisible={modalVisible}
          onChangeVisible={() => {
            setModalVisible(false)
          }}
          message={
            route?.params?.budget
              ? 'Ao excluir um orçamento ele não poderá ser recuperado. Deseja excluir o orçamento?'
              : 'Ao cancelar, este orçamento não ficará salvo. Deseja salvar o orçamento?'
          }
          buttonText={route?.params?.budget ? 'Voltar' : 'Salvar Orçamento'}
          secondButtonText={route?.params?.budget ? 'Excluir' : 'Não Salvar'}
          title='Atenção!'
          actionSecond={async () => {
            if (route?.params?.budget) {
              const response = await AsyncStorage.getItem('@budgetsList')
              if (response) {
                const jsonResponse = JSON.parse(response)
                const newBudgets = jsonResponse.filter(
                  (item: Budget) => item.id !== route?.params?.budget?.id
                )
                await AsyncStorage.setItem('@budgetsList', JSON.stringify(newBudgets))
              }
            }
            navigation.goBack()
            setModalVisible(false)
          }}
          icon={'alert'}
        />
      </Container>
      <ModalProduct
        transparent
        loading={false}
        modalIsVisible={modalVisibleProduct}
        onChangeVisible={() => setModalVisibleProduct(false)}
        message='Ao cancelar, este orçamento não ficará salvo. Deseja salvar o orçamento?'
        buttonText='Adicionar Item'
        title='Adicionar Item'
        setBudgets={setBudgets}
        budgets={budgets}
        actionSecond={() => {
          setModalVisible(false)
        }}
        products={products}
        productEdit={editProduct}
      />
      <ModalInfo
        transparent
        loading={false}
        modalIsVisible={modalSuccess}
        onChangeVisible={() => {
          setModalSuccess(false)
          navigation.goBack()
        }}
        closeButton={() => {
          setModalSuccess(false)
          navigation.goBack()
        }}
        message='Orçamento salvo com sucesso'
        buttonText='Voltar'
        icon='success'
      />
    </KeyboardAwareScrollView>
  )
}
