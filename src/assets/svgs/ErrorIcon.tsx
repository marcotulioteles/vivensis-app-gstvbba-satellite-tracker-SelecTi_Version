import React from 'react'
import { Svg, Path, SvgProps, G, Defs, Rect, ClipPath } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function ErrorIcon({ color = '#FF405B', ...props }: IconProps) {
  return (
    <Svg width='16' height='16' viewBox='0 0 16 16' fill='none' {...props}>
      <G clip-path='url(#clip0_679_6268)'>
        <Path
          d='M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z'
          fill={color}
        />
        <Path
          d='M5.12012 10.8801L8.00012 8.00012L10.8801 5.12012'
          stroke='white'
          stroke-miterlimit='10'
          stroke-linecap='round'
        />
        <Path
          d='M5.12012 5.12012L8.00012 8.00012L10.8801 10.8801'
          stroke='white'
          stroke-miterlimit='10'
          stroke-linecap='round'
        />
      </G>
      <Defs>
        <ClipPath id='clip0_679_6268'>
          <Rect width='16' height='16' rx='2' fill='white' />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
