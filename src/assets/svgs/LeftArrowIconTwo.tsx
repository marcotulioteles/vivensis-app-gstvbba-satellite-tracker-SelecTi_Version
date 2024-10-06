import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function LeftArrowIconTwo({ color = '#06E89C', ...props }: IconProps) {
  return (
    <Svg width='11' height='59' viewBox='0 0 11 59' fill='none' {...props}>
      <Path
        d='M11 -3.8147e-06L0.907474 5.61019L10.8123 11.5455L11 -3.8147e-06ZM5.47833 7.27568C-4.97599 28.5075 1.79236 49.7251 7.16249 58.5211L8.8695 57.4789C3.73703 49.0722 -2.79027 28.596 7.27262 8.15916L5.47833 7.27568Z'
        fill='#FFFDFD'
      />
    </Svg>
  )
}
