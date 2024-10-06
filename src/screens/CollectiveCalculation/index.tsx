import React, { useCallback, useState } from 'react'
import { useTheme } from 'styled-components'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import { Container, Text } from './styles'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { HeaderSecondary } from '~/components/HeaderSecondary'
import { FlatList } from 'react-native-gesture-handler'
import { Button } from '~/components/Button'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Item {
  id: number
  uuid?: string
  descricao: string
  url: string
  tipo: string
  conexoes: number
  db: number
  qualidade: number
  forca: number
  parentId?: string
  size?: string
  children?: Item[]
}

interface Tree {
  id: string
  client: string
  date: string
  antenna: Item
  children: Item[]
}

export const CollectiveCalculation = () => {
  const theme = useTheme()

  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [hasConnection, setHasConnection] = useState(false)
  const [calculations, setCalculations] = useState<
    {
      id: string
      client: string
      equipmentCount: number
      date: string
    }[]
  >([])

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

  useFocusEffect(
    useCallback(() => {
      async function loadCalculations() {
        try {
          const storedCalculations = await AsyncStorage.getItem('calculations@')
          if (storedCalculations) {
            const parsedCalculations: Tree[] = JSON.parse(storedCalculations)
            const calculationsWithEquipmentCount = parsedCalculations.map((calc) => ({
              ...calc,
              equipmentCount: countEquipment(calc.antenna),
            }))
            setCalculations(calculationsWithEquipmentCount)
          }
        } catch (error) {
          console.error('Erro ao carregar cálculos', error)
        }
      }
      loadCalculations()
    }, [])
  )

  const countEquipment = (item: Item): number => {
    let count = 1
    if (item.children) {
      item.children.forEach((child) => {
        count += countEquipment(child)
      })
    }
    return count
  }

  const renderItem = ({
    item,
  }: {
    item: { id: string; client: string; equipmentCount: number; date: string }
  }) => {
    const date = new Date(item.date)
    const formattedDate = format(date, "dd 'de' MMM", { locale: ptBR })
    const month = formattedDate.split(' ')[2].slice(0, 3).toUpperCase()

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('NewCollectiveCalculation', { id: item.id })
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.COLORS.BORDER_TEXT,
            borderRadius: 8,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 4,
              marginRight: 12,
              backgroundColor: theme.COLORS.GRAY_ICE_GRAY,
            }}
          >
            <Text isBold>{month}</Text>
            <Text>{formattedDate.split(' ')[0]}</Text>
          </View>
          <View>
            <Text style={{ maxWidth: '80%' }} numberOfLines={1} ellipsizeMode='tail'>
              {item.client ?? 'Cliente não informado'}
            </Text>
            <Text isBold>{item.equipmentCount ?? 0} equipamentos</Text>
          </View>
          <View style={{ position: 'absolute', top: 12, right: 12 }}>
            <MaterialCommunityIcons name='arrow-right' size={20} color={theme.COLORS.PRIMARY_500} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return loading ? (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}>
      <HeaderSecondary title='Cálculo da Coletiva' />
      <Container>
        <ActivityIndicator size='large' color={theme.COLORS.PRIMARY_400} />
      </Container>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.COLORS.WHITE }}
      contentContainerStyle={{ flex: 1 }}
    >
      <HeaderSecondary title='Cálculo da Coletiva' />
      <Container>
        <FlatList
          ListEmptyComponent={
            <Text>
              Ainda não há nenhum histórico de cálculo de coletiva, clique abaixo para criar um novo
              cálculo de coletiva.
            </Text>
          }
          data={calculations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
        <Button
          text={'Novo cálculo'}
          disabled={!hasConnection}
          onPress={() => {
            navigation.navigate('NewCollectiveCalculation')
          }}
          color={theme.COLORS.SECONDARY_400}
        />
      </Container>
    </KeyboardAwareScrollView>
  )
}
