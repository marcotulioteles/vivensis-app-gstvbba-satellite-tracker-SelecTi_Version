import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function CheckSmallIcon({ color = '#233B81', ...props }: IconProps) {
  return (
    <Svg width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
      <Path
        d='M7.95898 15.0001L3.20898 10.2501L4.39648 9.06258L7.95898 12.6251L15.6048 4.97925L16.7923 6.16675L7.95898 15.0001Z'
        fill='white'
      />
    </Svg>
  )
}
