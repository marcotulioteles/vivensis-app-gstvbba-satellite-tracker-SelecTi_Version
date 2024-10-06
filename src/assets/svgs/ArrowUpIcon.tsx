import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function ArrowUpIcon({ color = '#fff', ...props }: IconProps) {
  return (
    <Svg width='42' height='22' viewBox='0 0 42 22' fill='none' {...props}>
      <Path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M0 22L21 0L42 22L21 16.3429L0 22Z'
        fill={color}
      />
    </Svg>
  )
}
