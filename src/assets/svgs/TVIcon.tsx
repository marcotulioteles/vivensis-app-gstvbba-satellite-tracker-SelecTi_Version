import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function TVIcon({ color = '#233B81', ...props }: IconProps) {
  return (
    <Svg width='56' height='56' viewBox='0 0 56 56' fill='none' {...props}>
      <Path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M21.7555 8.28619C21.3614 7.9046 20.7224 7.9046 20.3283 8.28619C19.9342 8.66777 19.9342 9.28644 20.3283 9.66803L27.3998 16.5147C27.7939 16.8963 28.4329 16.8963 28.827 16.5147L35.8985 9.66803C36.2927 9.28644 36.2927 8.66777 35.8985 8.28619C35.5044 7.9046 34.8654 7.9046 34.4713 8.28619L28.1134 14.442L21.7555 8.28619ZM21.0999 8.0986C20.8483 8.08312 20.5913 8.16847 20.399 8.35465C20.0439 8.69842 20.0439 9.25579 20.399 9.59957L27.4705 16.4462C27.6337 16.6042 27.8434 16.6896 28.057 16.7024C27.844 16.6893 27.6349 16.6039 27.4721 16.4463L20.4006 9.59966C20.0455 9.25589 20.0455 8.69852 20.4006 8.35475C20.5925 8.16895 20.8488 8.08357 21.0999 8.0986ZM35.2429 8.0986C34.9913 8.08312 34.7343 8.16847 34.542 8.35465L28.1142 14.5782L28.115 14.579L34.5436 8.35475C34.7355 8.16895 34.9918 8.08357 35.2429 8.0986ZM9.79046 20.6142C10.3556 20.0833 11.1228 19.7845 11.9233 19.7845H44.0765C44.877 19.7845 45.6442 20.0833 46.2093 20.6142C46.7744 21.145 47.0913 21.8643 47.0913 22.6137V43.3783C47.0913 44.1277 46.7744 44.847 46.2093 45.3778C45.6442 45.9087 44.877 46.2075 44.0765 46.2075H11.9233C11.1228 46.2075 10.3556 45.9087 9.79046 45.3778C9.22539 44.847 8.90851 44.1277 8.90851 43.3783V22.6137C8.90851 21.8643 9.22539 21.145 9.79046 20.6142ZM11.9233 17.892C10.592 17.892 9.31461 18.3887 8.37231 19.2739C7.42991 20.1591 6.8999 21.3604 6.8999 22.6137V43.3783C6.8999 44.6316 7.42991 45.8329 8.37231 46.7181C9.31461 47.6033 10.592 48.1 11.9233 48.1H44.0765C45.4078 48.1 46.6852 47.6033 47.6275 46.7181C48.5699 45.8329 49.0999 44.6316 49.0999 43.3783V22.6137C49.0999 21.3604 48.5699 20.1591 47.6275 19.2739C46.6852 18.3887 45.4078 17.892 44.0765 17.892H11.9233ZM44.275 19.6937C45.0286 19.7388 45.7418 20.0401 46.279 20.5447C46.8631 21.0934 47.1913 21.8377 47.1913 22.6137V43.3783C47.1913 44.1544 46.8631 44.8986 46.279 45.4473C45.6948 45.996 44.9026 46.3043 44.0765 46.3043H11.9233C11.8575 46.3043 11.7918 46.3023 11.7264 46.2984C11.7923 46.3024 11.8585 46.3044 11.9249 46.3044H44.078C44.9041 46.3044 45.6964 45.9961 46.2805 45.4474C46.8647 44.8987 47.1929 44.1544 47.1929 43.3784V22.6137C47.1929 21.8377 46.8647 21.0935 46.2805 20.5448C45.743 20.0398 45.0292 19.7385 44.275 19.6937ZM8.44195 19.3434C9.36527 18.4761 10.6176 17.9888 11.9233 17.9888H44.0765C44.1813 17.9888 44.2858 17.9919 44.3898 17.9982C44.2863 17.992 44.1823 17.9889 44.078 17.9889H11.9249C10.6191 17.9889 9.36683 18.4761 8.44351 19.3435C7.52018 20.2108 7.00146 21.3872 7.00146 22.6137V43.3784C7.00146 44.605 7.52018 45.7814 8.44351 46.6487C9.29271 47.4464 10.4202 47.9226 11.6116 47.9939C10.4196 47.9229 9.29152 47.4467 8.44195 46.6486C7.51862 45.7813 6.9999 44.6049 6.9999 43.3783V22.6137C6.9999 21.3871 7.51862 20.2107 8.44195 19.3434Z'
        fill={color}
      />
      <Path
        d='M26.466 28.624C26.8405 28.624 27.144 28.9276 27.144 29.302C27.144 29.6765 26.8405 29.98 26.466 29.98H24.112C24.0015 29.98 23.912 30.0696 23.912 30.18V36.16C23.912 36.6239 23.5359 37 23.072 37C22.6081 37 22.232 36.6239 22.232 36.16V30.18C22.232 30.0696 22.1425 29.98 22.032 29.98H19.678C19.3036 29.98 19 29.6765 19 29.302C19 28.9276 19.3036 28.624 19.678 28.624H26.466Z'
        fill={color}
      />
      <Path
        d='M36.1404 28.624C36.7197 28.624 37.1223 29.2005 36.9229 29.7445L34.5504 36.2132C34.377 36.6858 33.9271 37 33.4237 37H33.0598C32.5564 37 32.1065 36.6858 31.9332 36.2132L29.5637 29.7526C29.3628 29.2047 29.7683 28.624 30.3519 28.624C30.7097 28.624 31.0283 28.8509 31.1453 29.1891L33.0643 34.7362C33.1264 34.9159 33.3805 34.9157 33.4424 34.7359L35.3523 29.1863C35.4681 28.8499 35.7846 28.624 36.1404 28.624Z'
        fill={color}
      />
    </Svg>
  )
}
