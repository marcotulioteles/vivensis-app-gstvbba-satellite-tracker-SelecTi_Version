import React from 'react'
import { Svg, Path, SvgProps, ClipPath, Defs, G, Rect } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function AlertIcon({ color = '#08875D', ...props }: IconProps) {
  return (
    <Svg width='50' height='50' viewBox='0 0 50 50' fill='none' {...props}>
      <G clip-path='url(#clip0_278_2070)'>
        <Path
          d='M25 50C38.8071 50 50 38.8071 50 25C50 11.1929 38.8071 0 25 0C11.1929 0 0 11.1929 0 25C0 38.8071 11.1929 50 25 50Z'
          fill='#E06D2D'
        />
      </G>
      <Rect x='24' y='11' width='2' height='20' rx='1' fill='white' />
      <Rect width='4' height='4' rx='2' transform='matrix(1 0 0 -1 23 38)' fill='white' />
      <Defs>
        <ClipPath id='clip0_278_2070'>
          <Rect width='50' height='50' fill='white' />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
