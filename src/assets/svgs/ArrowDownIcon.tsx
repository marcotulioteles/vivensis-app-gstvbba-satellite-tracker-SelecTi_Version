import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function ArrowDownIcon({ color = '#fff', ...props }: IconProps) {
  return (
    <Svg width='42' height='22' viewBox='0 0 42 22' fill='none' {...props}>
      <Path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M0 0L21 22L42 0L21 5.65714L0 0Z'
        fill={color}
      />
    </Svg>
  )
}
