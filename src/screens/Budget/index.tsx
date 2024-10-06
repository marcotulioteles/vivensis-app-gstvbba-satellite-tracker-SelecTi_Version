import React, { useCallback, useEffect, useState } from 'react'

import { useTheme } from 'styled-components'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, FlatList, ScrollView, TouchableOpacity, View } from 'react-native'
import { Container } from './styles'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { Button } from '~/components/Button'
import { normalize } from '~/utils'
import { Label } from '~/components/Label/variants/index'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Budget as IBudgets } from '../BudgetNew'
import { Input } from '~/components/Input'
import { Line } from '~/components/Containers/styles'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { IconStyled } from '../Home/styles'
import ModalFilter, { IFilter } from '~/components/ModalFilter'

export const Budget = () => {
  const theme = useTheme()
  const navigation = useNavigation()
  const [modalFilter, setModalFilter] = useState(false)
  const [filters, setFilters] = useState<IFilter>()
  const [loading, setLoading] = useState(false)
  const [budgets, setBudgets] = useState<IBudgets[]>([])
  const [filter, setFilter] = useState('')

  useFocusEffect(
    useCallback(() => {
      const getBudgets = async () => {
        setLoading(true)
        const response = await AsyncStorage.getItem('@budgetsList')
        if (response) {
          setBudgets(JSON.parse(response))
        }
        setLoading(false)
      }
      getBudgets()
    }, [])
  )

  const setStartOfDay = (date: any) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(1, 1, 1, 1)
    return startOfDay
  }

  const setEndOfDay = (date: any) => {
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    return endOfDay
  }
  useEffect(() => {
    const getBudgets = async () => {
      setLoading(true)
      const response = await AsyncStorage.getItem('@budgetsList')
      if (response) {
        const parsedResponse = JSON.parse(response)

        const filteredBudgets = parsedResponse.filter((budget: IBudgets) => {
          const budgetDate = new Date(Number(budget.id))
          const budgetTotalPrice = budget.products?.reduce(
            (acc, product) => Number(product.quantity) * Number(product.price) + acc,
            0
          )

          let isWithinDateRange = false

          if (!filters?.startAt && !filters?.endAt) {
            isWithinDateRange = true
          } else if (filters?.startAt && filters?.endAt) {
            isWithinDateRange =
              budgetDate >= setStartOfDay(filters?.startAt) &&
              budgetDate <= setEndOfDay(filters?.endAt)
          } else if (filters?.startAt && !filters?.endAt) {
            isWithinDateRange = budgetDate >= setStartOfDay(filters?.startAt)
          } else if (!filters?.startAt && filters?.endAt) {
            isWithinDateRange = budgetDate <= setEndOfDay(filters.endAt)
          }

          const isWithinPriceRange =
            (!filters?.minPrice ||
              Number(filters.minPrice) <= 0 ||
              budgetTotalPrice >= Number(filters.minPrice)) &&
            (!filters?.maxPrice ||
              Number(filters.maxPrice) <= 0 ||
              budgetTotalPrice <= Number(filters.maxPrice))

          return isWithinDateRange && isWithinPriceRange
        })

        setBudgets(filteredBudgets)
      }
      setLoading(false)
    }
    getBudgets()
  }, [filters])

  const renderFilters = () => {
    return (
      <Line style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        {filters?.startAt && (
          <View
            style={{
              backgroundColor: theme.COLORS.SECONDARY_400,
              borderRadius: 12,
              paddingVertical: 4,
              paddingHorizontal: 16,
              marginRight: 8,
              marginTop: 8,
            }}
          >
            <Label fontSize={16} color={theme.COLORS.WHITE} lineHeight={25}>
              De: {format(new Date(filters?.startAt), 'dd/MM/yyyy', { locale: ptBR })}
            </Label>
          </View>
        )}
        {filters?.endAt && (
          <View
            style={{
              backgroundColor: theme.COLORS.SECONDARY_400,
              borderRadius: 12,
              paddingVertical: 4,
              paddingHorizontal: 16,
              marginTop: 8,
            }}
          >
            <Label fontSize={16} color={theme.COLORS.WHITE} lineHeight={25}>
              Até: {format(new Date(filters?.endAt), 'dd/MM/yyyy', { locale: ptBR })}
            </Label>
          </View>
        )}

        {filters?.minPrice && Number(filters.minPrice) > 0 && (
          <View
            style={{
              backgroundColor: theme.COLORS.SECONDARY_400,
              borderRadius: 12,
              paddingVertical: 4,
              paddingHorizontal: 16,
              marginTop: 8,
            }}
          >
            <Label fontSize={16} color={theme.COLORS.WHITE} lineHeight={25}>
              De:{' '}
              {Number(filters?.minPrice ?? 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Label>
          </View>
        )}
        {filters?.maxPrice && Number(filters.maxPrice) > 0 && (
          <View
            style={{
              backgroundColor: theme.COLORS.SECONDARY_400,
              borderRadius: 12,
              paddingVertical: 4,
              paddingHorizontal: 16,
              marginTop: 8,
              marginLeft: filters?.minPrice ? 8 : 0,
            }}
          >
            <Label fontSize={16} color={theme.COLORS.WHITE} lineHeight={25}>
              Até:{' '}
              {Number(filters?.maxPrice ?? 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Label>
          </View>
        )}
        {filters?.startAt || filters?.endAt || filters?.minPrice || filters?.maxPrice ? (
          <TouchableOpacity onPress={() => setFilters({})} style={{ marginLeft: 8 }}>
            <Label fontSize={16} color={theme.COLORS.SECONDARY_400} lineHeight={25}>
              Limpar Filtros
            </Label>
          </TouchableOpacity>
        ) : null}
      </Line>
    )
  }

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Orçamentos' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <HeaderSecondary title='Orçamentos' hasFilter action={() => setModalFilter(true)} />
      <Container>
        {budgets.length ? (
          <View style={{ marginBottom: 24 }}>
            <Input
              placeholder={`Busque pelo nome`}
              onChangeText={(e) => setFilter(e)}
              icon='magnify'
              iconSize={20}
            />
            {renderFilters()}
            <FlatList
              data={budgets.filter((budget) => {
                if (filter) {
                  return budget.name.toLowerCase().includes(filter.toLowerCase())
                }
                return budget
              })}
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item }) => {
                const val =
                  item?.products?.reduce(
                    (acc, product) => Number(product.quantity) * Number(product.price) + acc,
                    0
                  ) ?? 0
                return (
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: theme.COLORS.GRAY_08,
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 8,
                    }}
                    onPress={() => navigation.navigate('BudgetNew', { budget: item })}
                  >
                    <Line>
                      <View
                        style={{
                          backgroundColor: theme.COLORS.GRAY_ICE_GRAY,
                          borderRadius: 4,
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 50,
                          height: 50,
                          marginRight: 16,
                        }}
                      >
                        <Label
                          textAlign='left'
                          fontSize={14}
                          color={theme.COLORS.PRIMARY_400}
                          lineHeight={21}
                        >
                          {format(new Date(Number(item.id)), 'MMM', { locale: ptBR })}
                        </Label>
                        <Label
                          textAlign='left'
                          fontSize={17}
                          isMedium
                          color={theme.COLORS.PRIMARY_400}
                          lineHeight={26}
                        >
                          {format(new Date(Number(item.id)), 'dd', { locale: ptBR })}
                        </Label>
                      </View>
                      <View style={{ width: '71%' }}>
                        <Label
                          textAlign='left'
                          fontSize={16}
                          color={theme.COLORS.PRIMARY_500}
                          lineHeight={25}
                          numberOfLines={1}
                          ellipsizeMode='tail'
                        >
                          {item.name}
                        </Label>
                        <Label
                          textAlign='left'
                          isMedium
                          fontSize={val > 100000 ? 13 : 16}
                          color={theme.COLORS.PRIMARY_500}
                          lineHeight={25}
                        >
                          {item.products?.length
                            ? val.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })
                            : 'R$ 0,00'}
                        </Label>
                      </View>
                      <View
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                        }}
                      >
                        <View>
                          <IconStyled
                            name='arrow-right'
                            color={theme.COLORS.PRIMARY_400}
                            size={normalize(18)}
                          />
                        </View>
                      </View>
                    </Line>
                  </TouchableOpacity>
                )
              }}
            />
          </View>
        ) : (
          <>
            {renderFilters()}
            <Label fontSize={16} color={theme.COLORS.DARK_GRAY} lineHeight={25}>
              {!filters?.endAt && !filters?.startAt && !filters?.minPrice && !filters?.maxPrice
                ? 'Ainda não há nenhum histórico de orçamento, clique abaixo para criar um novo orçamento.'
                : 'Ainda não há nenhum histórico de orçamento com esses filtros, clique abaixo para criar um novo orçamento.'}
            </Label>
          </>
        )}
        <View
          style={{
            marginTop: 'auto',
            marginBottom: 40,
            width: '100%',
          }}
        >
          <Button
            text='Novo orçamento'
            onPress={() => {
              navigation.navigate('BudgetNew', { budget: undefined })
            }}
            color={theme.COLORS.SECONDARY_400}
          />
        </View>
        <ModalFilter
          transparent
          loading={false}
          filter={filters}
          onChangeVisible={() => setModalFilter(false)}
          modalIsVisible={modalFilter}
          message=''
          title='Filtrar Orçamentos'
          setFilters={setFilters}
        />
      </Container>
    </ScrollView>
  )
}
