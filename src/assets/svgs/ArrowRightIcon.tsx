import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function ArrowRightIcon({ color = '#fff', ...props }: IconProps) {
  return (
    <Svg width='22' height='42' viewBox='0 0 22 42' fill='none' {...props}>
      <Path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M0 42L22 21L1.83588e-06 -9.61651e-07L5.65715 21L0 42Z'
        fill={color}
      />
    </Svg>
  )
}
