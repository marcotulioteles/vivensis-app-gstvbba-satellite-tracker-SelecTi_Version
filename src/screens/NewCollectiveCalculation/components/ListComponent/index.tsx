import React from 'react'
import { Container, ContentButton, NoImage, TextLabel } from './styles'
import { Image, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native'
import { MaterialIcons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'
import { ArrowChildren, CheckIcon, ErrorIcon } from '~/assets/svgs'
import { normalize } from '~/utils'

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

interface Props extends TouchableOpacityProps {
  isAntenna?: boolean
  isLNBF?: boolean
  isAdd?: boolean
  isEdit?: boolean
  isDelete?: boolean
  title: string
  handleDelete?: () => void
  handleAdd?: () => void
  handleEdit?: () => void
  url?: string
  size?: string
  tree: Item[]
  uuid: string
}

const itens = [
  {
    id: 1,
    descricao: 'Receptor VX10 da Nova Parabólica Digital',
    url: 'http://vxapp.vivensis2.com.br/files/Receptor.jpg',
    tipo: 'TERMINAL',
    conexoes: 0,
    db: 0,
    qualidade: 0,
    forca: 0,
  },
  {
    id: 2,
    descricao: 'Cabo Coaxial',
    url: 'http://vxapp.vivensis2.com.br/files/cabo_coaxial.jpg',
    tipo: 'CABO',
    conexoes: 2,
    db: -0.067,
    qualidade: -1,
    forca: -1,
  },
  {
    id: 3,
    descricao: 'Antena de 60 cm Vivensis + LNBF Multi ponto',
    url: 'http://vxapp.vivensis2.com.br/files/conector_cabo.jpg',
    tipo: '',
    conexoes: 1,
    db: 12,
    qualidade: 100,
    forca: 100,
  },
  {
    id: 4,
    descricao: 'Antena de 75 cm Vivensis + LNBF Multi ponto',
    url: 'http://vxapp.vivensis2.com.br/files/conector_cabo.jpg',
    tipo: '',
    conexoes: 1,
    db: 13,
    qualidade: 100,
    forca: 100,
  },
  {
    id: 5,
    descricao: 'Antena de 90 cm Vivensis + LNBF Multi ponto',
    url: 'http://vxapp.vivensis2.com.br/files/conector_cabo.jpg',
    tipo: '',
    conexoes: 1,
    db: 14,
    qualidade: 100,
    forca: 100,
  },
  {
    id: 6,
    descricao: 'Divisor 1/2',
    url: 'http://vxapp.vivensis2.com.br/files/conector_cabo.jpg',
    tipo: '',
    conexoes: 2,
    db: -1.2,
    qualidade: -2,
    forca: -4,
  },
  {
    id: 7,
    descricao: 'Divisor 1/4',
    url: 'http://vxapp.vivensis2.com.br/files/conector_cabo.jpg',
    tipo: '',
    conexoes: 4,
    db: -1.2,
    qualidade: -2,
    forca: -2,
  },
  {
    id: 8,
    descricao: 'Divisor 1/8',
    url: 'http://vxapp.vivensis2.com.br/files/conector_cabo.jpg',
    tipo: '',
    conexoes: 8,
    db: -1.2,
    qualidade: -2,
    forca: -2,
  },
  {
    id: 9,
    descricao: 'Amplificador de Linha Satelite 20db',
    url: 'http://vxapp.vivensis2.com.br/files/conector_cabo.jpg',
    tipo: '',
    conexoes: 1,
    db: 6,
    qualidade: 30,
    forca: 25,
  },
  {
    id: 10,
    descricao: 'Amplificador de Linha Satelite 10db',
    url: 'http://vxapp.vivensis2.com.br/files/conector_cabo.jpg',
    tipo: '',
    conexoes: 1,
    db: 3,
    qualidade: 30,
    forca: 25,
  },
]

const calculateSignal = (
  tree: Item[],
  uuid: string
): { status: string; level: number; db: number; qualidade: number; forca: number } => {
  const findItemByUUID = (items: Item[], uuid: string): Item | undefined => {
    for (const item of items) {
      if (item.uuid === uuid) return item
      if (item.children) {
        const found = findItemByUUID(item.children, uuid)
        if (found) return found
      }
    }
    return undefined
  }

  const item = findItemByUUID(tree, uuid)
  if (!item) return { status: '', level: 0, db: 0, qualidade: 0, forca: 0 }

  let db = item.db
  let qualidade = item.qualidade
  let forca = item.forca

  let level = 0

  const traverseUp = (currentUUID: string) => {
    const currentItem = findItemByUUID(tree, currentUUID)
    if (currentItem && currentItem.parentId) {
      const parentItem = findItemByUUID(tree, currentItem.parentId)
      if (parentItem) {
        db += parentItem.db
        qualidade += parentItem.qualidade
        forca += parentItem.forca

        if (currentItem.size) {
          const cableLength = parseFloat(currentItem.size)
          const cableLoss = itens[1].db * cableLength // Assumindo que o item com id 2 é o cabo
          const cableQualityLoss = itens[1].qualidade * cableLength
          const cableForceLoss = itens[1].forca * cableLength

          db += cableLoss
          qualidade += cableQualityLoss
          forca += cableForceLoss
        }

        traverseUp(parentItem.uuid!)
      }
    }
    level++
  }

  traverseUp(item.uuid!)

  const status =
    db < 10
      ? 'Sinal Insuficiente'
      : db >= 10 && db <= 18 && qualidade >= 80 && forca >= 80
      ? 'Sinal Bom'
      : db > 18
      ? 'Sinal Saturado'
      : 'Sinal Insuficiente'

  return { status, level, db, qualidade, forca }
}

export const ListComponent = ({
  isAntenna = false,
  title,
  isAdd,
  isEdit,
  isDelete,
  handleDelete,
  handleAdd,
  handleEdit,
  url,
  size,
  tree,
  uuid,
}: Props) => {
  const { status, level, db, qualidade, forca } = calculateSignal(tree, uuid)

  const firstLevelReduction = 16 // Initial reduction percentage
  const subsequentLevelReduction = 5 // Reduction per subsequent level
  let textWidth

  if (level === 0) {
    textWidth = '80%' // No reduction for root level
  } else if (level === 1) {
    textWidth = `${100 - firstLevelReduction}%`
  } else {
    textWidth = `${100 - firstLevelReduction - (level - 1) * subsequentLevelReduction}%`
  }

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: '#ebebeb',
        width: '100%',
        paddingTop: normalize(8),
      }}
    >
      <Container>
        {isAntenna ? null : (
          <View style={{ marginTop: normalize(-24), width: 16 }}>
            <ArrowChildren
              width={32}
              height={32}
              style={{
                position: 'absolute',
                left: normalize(-8),
              }}
            />
          </View>
        )}
        <View style={{ marginLeft: isAntenna ? 0 : 4 }}>
          {url ? (
            <Image
              source={{ uri: url }}
              style={{
                width: normalize(34),
                height: normalize(34),
                borderRadius: 8,
                marginRight: 8,
              }}
              resizeMode='contain'
            />
          ) : (
            <NoImage />
          )}
        </View>

        <View style={{ width: textWidth }}>
          <TextLabel ellipsizeMode='tail' style={{ flexShrink: 1 }} numberOfLines={2}>
            {title} {size ? `(${size}m)` : ''}
          </TextLabel>
          {(title.includes('Receptor') || title === 'Receptor VX10 da Nova Parabólica Digital') && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              {status === 'Sinal Bom' ? (
                <CheckIcon width={16} height={16} style={{ marginRight: 4 }} />
              ) : (
                <ErrorIcon
                  color={status === 'Sinal Saturado' ? '#E06D2D' : '#E02D3C'}
                  width={16}
                  height={16}
                  style={{ marginRight: 4 }}
                />
              )}
              <TextLabel
                numberOfLines={2}
                ellipsizeMode='tail'
                style={{
                  color:
                    status === 'Sinal Bom'
                      ? '#08875D'
                      : status === 'Sinal Saturado'
                      ? '#E06D2D'
                      : '#E02D3C',
                }}
              >
                {status}
              </TextLabel>
            </View>
          )}
        </View>
        <ContentButton>
          {isAdd ? (
            <TouchableOpacity onPress={handleAdd}>
              <MaterialIcons name='add' size={18} />
            </TouchableOpacity>
          ) : null}
          {isEdit ? (
            <TouchableOpacity onPress={handleEdit}>
              <MaterialCommunityIcons name='pencil-outline' size={18} />
            </TouchableOpacity>
          ) : null}
          {isDelete ? (
            <TouchableOpacity onPress={handleDelete}>
              <AntDesign name='delete' size={18} />
            </TouchableOpacity>
          ) : null}
        </ContentButton>
      </Container>
    </View>
  )
}
