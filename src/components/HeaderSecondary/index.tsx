import React from 'react'

import { Container } from './styles'
import { useTheme } from 'styled-components/native'
import { IconStyled } from '~/screens/Home/styles'
import { Label } from '../Label/variants'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AlertIconOutline, ShareIcon, TrashIcon } from '~/assets/svgs'
import { normalize } from '~/utils'

type HeaderSecondaryProps = {
  title: string
  handleLeftAction?: () => void
  hasAnotherAction?: boolean
  hasFilter?: boolean
  action?: () => void
  isInfo?: boolean
  isShare?: boolean
  isDelete?: boolean
}

export const HeaderSecondary = ({
  title,
  hasAnotherAction,
  handleLeftAction,
  hasFilter,
  action,
  isShare,
  isInfo = false,
  isDelete = false,
}: HeaderSecondaryProps) => {
  const theme = useTheme()
  const navigation = useNavigation()
  return (
    <Container>
      <TouchableOpacity
        onPress={() => {
          if (hasAnotherAction && handleLeftAction) {
            handleLeftAction()
            return
          }
          navigation.goBack()
        }}
      >
        <IconStyled
          name='arrow-left'
          size={24}
          color={theme.COLORS.PRIMARY_500}
          style={{ marginRight: 8 }}
        />
      </TouchableOpacity>
      <Label isBold color={theme.COLORS.PRIMARY_500} fontSize={21}>
        {title}
      </Label>
      {hasFilter && (
        <TouchableOpacity
          onPress={() => {
            if (action) action()
          }}
          style={{ marginLeft: 'auto', marginRight: 20 }}
        >
          <IconStyled
            name='filter-outline'
            size={24}
            color={theme.COLORS.PRIMARY_400}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      )}
      {isShare && (
        <TouchableOpacity
          onPress={() => {
            if (action) action()
          }}
          style={{ marginLeft: 'auto', marginRight: 20 }}
        >
          <ShareIcon />
        </TouchableOpacity>
      )}
      {isInfo && (
        <TouchableOpacity
          onPress={() => {
            if (action) action()
          }}
          style={{ marginLeft: 'auto', marginRight: 20 }}
        >
          <AlertIconOutline
            color={theme.COLORS.PRIMARY_500}
            width={normalize(18)}
            height={normalize(18)}
            style={{ marginLeft: normalize(16) }}
          />
        </TouchableOpacity>
      )}
      {isDelete && (
        <TouchableOpacity
          onPress={() => {
            if (action) action()
          }}
          style={{ marginLeft: 'auto', marginRight: 20 }}
        >
          <TrashIcon />
        </TouchableOpacity>
      )}
    </Container>
  )
}
