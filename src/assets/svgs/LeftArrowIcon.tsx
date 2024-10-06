import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function LeftArrowIcon({ color = '#06E89C', ...props }: IconProps) {
  return (
    <Svg width='11' height='59' viewBox='0 0 11 59' fill='none' {...props}>
      <Path
        d='M11 59L0.907474 53.3898L10.8123 47.4545L11 59ZM5.47833 51.7243C-4.97599 30.4925 1.79236 9.2749 7.16249 0.478917L8.8695 1.52108C3.73703 9.9278 -2.79027 30.404 7.27262 50.8408L5.47833 51.7243Z'
        fill='#FFFDFD'
      />
    </Svg>
  )
}
