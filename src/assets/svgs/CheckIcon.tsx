import React from 'react'
import { Svg, Path, SvgProps, ClipPath, Defs, G, Rect } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function CheckIcon({ color = '#08875D', ...props }: IconProps) {
  return (
    <Svg width='16' height='16' viewBox='0 0 16 16' fill='none' {...props}>
      <G clip-path='url(#clip0_679_6254)'>
        <Path
          d='M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z'
          fill='#08875D'
        />
        <Path
          d='M12.1598 4.80005L7.03984 10.56L3.83984 8.00005'
          stroke='white'
          stroke-miterlimit='10'
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </G>
      <Defs>
        <ClipPath id='clip0_679_6254'>
          <Rect width='16' height='16' rx='2' fill='white' />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
