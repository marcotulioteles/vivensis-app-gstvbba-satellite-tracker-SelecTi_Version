import React from 'react'
import { Svg, Path, SvgProps, Defs, G, Rect, ClipPath } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function ShareIcon({ color = '#233B81', ...props }: IconProps) {
  return (
    <Svg width='24' height='24' viewBox='0 0 24 24' fill='none' {...props}>
      <G clip-path='url(#clip0_209_4305)'>
        <Path
          fill-rule='evenodd'
          clip-rule='evenodd'
          d='M11.4697 1.71967C11.7626 1.42678 12.2374 1.42678 12.5303 1.71967L17.0303 6.21967C17.3232 6.51256 17.3232 6.98744 17.0303 7.28033C16.7374 7.57322 16.2626 7.57322 15.9697 7.28033L12.75 4.06066V15C12.75 15.4142 12.4142 15.75 12 15.75C11.5858 15.75 11.25 15.4142 11.25 15V4.06066L8.03033 7.28033C7.73744 7.57322 7.26256 7.57322 6.96967 7.28033C6.67678 6.98744 6.67678 6.51256 6.96967 6.21967L11.4697 1.71967ZM3.75 12C4.16421 12 4.5 12.3358 4.5 12.75V18.75C4.5 18.9489 4.57902 19.1397 4.71967 19.2803C4.86032 19.421 5.05109 19.5 5.25 19.5H18.75C18.9489 19.5 19.1397 19.421 19.2803 19.2803C19.421 19.1397 19.5 18.9489 19.5 18.75V12.75C19.5 12.3358 19.8358 12 20.25 12C20.6642 12 21 12.3358 21 12.75V18.75C21 19.3467 20.7629 19.919 20.341 20.341C19.919 20.7629 19.3467 21 18.75 21H5.25C4.65326 21 4.08097 20.7629 3.65901 20.341C3.23705 19.919 3 19.3467 3 18.75V12.75C3 12.3358 3.33579 12 3.75 12Z'
          fill='black'
        />
      </G>
      <Defs>
        <ClipPath id='clip0_209_4305'>
          <Rect width='24' height='24' fill='white' />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
