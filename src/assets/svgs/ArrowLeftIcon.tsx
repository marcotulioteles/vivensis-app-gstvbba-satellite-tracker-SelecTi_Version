import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function ArrowLeftIcon({ color = '#fff', ...props }: IconProps) {
  return (
    <Svg width='22' height='42' viewBox='0 0 22 42' fill='none' {...props}>
      <Path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M22 42L-9.17939e-07 21L22 -9.61651e-07L16.3429 21L22 42Z'
        fill={color}
      />
    </Svg>
  )
}
