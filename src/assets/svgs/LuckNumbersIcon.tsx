import React from 'react'
import { Svg, Path, SvgProps } from 'react-native-svg'

type IconProps = {
  color?: string
} & SvgProps
export default function LuckNumbersIcon({ color = '#233B81', ...props }: IconProps) {
  return (
    <Svg width='42' height='42' viewBox='0 0 42 42' fill='none' {...props}>
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M17.5991 19.1565C15.1077 16.4319 13.121 14.3385 11.3217 12.8934C9.34456 11.3053 7.59389 10.5 5.649 10.5C2.499 10.5 0 13.125 0 16.275C0 17.5963 0.404639 18.8726 1.14813 19.9312C1.4209 20.3196 1.73927 20.6787 2.1 21C1.74277 21.3182 1.42707 21.6734 1.15608 22.0598C0.407522 23.1273 0 24.4325 0 25.851C0 29.001 2.625 31.5 5.775 31.5C7.65592 31.5 9.37177 30.6982 11.3271 29.1171C13.1146 27.6716 15.1023 25.5747 17.5992 22.8435C18.1178 22.2762 18.6584 21.6815 19.2238 21.0597L19.278 21L19.2254 20.9422C18.6595 20.3196 18.1183 19.7244 17.5991 19.1565ZM16.3031 21C13.7983 18.2552 11.9028 16.2385 10.2272 14.8405C8.30861 13.2397 6.96489 12.7 5.649 12.7C3.77671 12.7 2.2 14.2764 2.2 16.275C2.2 17.4681 2.69884 18.5873 3.56319 19.3571L5.40783 21L3.56319 22.6429C2.71563 23.3977 2.2 24.5086 2.2 25.851C2.2 27.7233 3.77638 29.3 5.775 29.3C7.01251 29.3 8.32066 28.7755 10.2367 27.1647C11.9024 25.7645 13.7985 23.745 16.3031 21ZM19.1565 24.4009C16.4319 26.8923 14.3385 28.879 12.8934 30.6783C11.3053 32.6554 10.5 34.4061 10.5 36.351C10.5 39.501 13.125 42 16.275 42C17.5963 42 18.8726 41.5954 19.9312 40.8519C20.3196 40.5791 20.6787 40.2607 21 39.9C21.3182 40.2572 21.6734 40.5729 22.0598 40.8439C23.1272 41.5925 24.4325 42 25.851 42C29.001 42 31.5 39.375 31.5 36.225C31.5 34.3422 30.6966 32.6247 29.1122 30.6669C27.6834 28.9014 25.6195 26.9403 22.9369 24.4862C22.3416 23.9416 21.7158 23.3727 21.0597 22.7762L21 22.722L20.9422 22.7746C20.3196 23.3405 19.7244 23.8816 19.1565 24.4009ZM21 25.6969C18.2552 28.2017 16.2385 30.0972 14.8405 31.7728C13.2397 33.6914 12.7 35.0351 12.7 36.351C12.7 38.2233 14.2764 39.8 16.275 39.8C17.4681 39.8 18.5873 39.3012 19.3571 38.4368L21 36.5922L22.6429 38.4368C23.3977 39.2844 24.5086 39.8 25.851 39.8C27.7233 39.8 29.3 38.2236 29.3 36.225C29.3 34.9875 28.7755 33.6793 27.1647 31.7633C25.7645 30.0976 23.745 28.2015 21 25.6969ZM30.6738 29.1013C32.6515 30.6929 34.4039 31.5 36.351 31.5C39.501 31.5 42 28.875 42 25.725C42 24.4037 41.5954 23.1274 40.8519 22.0688C40.5791 21.6804 40.2607 21.3213 39.9 21C40.2572 20.6818 40.5729 20.3266 40.8439 19.9402C41.5925 18.8728 42 17.5675 42 16.149C42 12.999 39.375 10.5 36.225 10.5C34.3419 10.5 32.6243 11.3036 30.6685 12.8883C28.9036 14.3183 26.9448 16.3843 24.4954 19.0699C23.9388 19.6803 23.3568 20.3226 22.746 20.9967L22.743 21L22.7459 21.0032C23.3567 21.6774 23.9387 22.3197 24.4955 22.93C26.9395 25.6091 28.8975 27.6717 30.6738 29.1013ZM19.1565 17.5992C19.7238 18.1178 20.3185 18.6584 20.9403 19.2238L21 19.278L21.0578 19.2254C21.7146 18.6284 22.341 18.0589 22.9369 17.5137C25.613 15.065 27.6734 13.1047 29.1018 11.3277C30.6931 9.34809 31.5 7.59585 31.5 5.649C31.5 2.499 28.875 0 25.725 0C24.4037 0 23.1274 0.404639 22.0688 1.14813C21.6804 1.4209 21.3213 1.73927 21 2.1C20.6818 1.74277 20.3266 1.42707 19.9402 1.15608C18.8728 0.407523 17.5675 0 16.149 0C12.999 0 10.5 2.625 10.5 5.775C10.5 7.65592 11.3018 9.37177 12.8829 11.3271C14.3284 13.1146 16.4253 15.1023 19.1565 17.5992ZM21 16.3031C23.7448 13.7983 25.7615 11.9028 27.1595 10.2272C28.7603 8.30861 29.3 6.96489 29.3 5.649C29.3 3.77671 27.7236 2.2 25.725 2.2C24.5319 2.2 23.4127 2.69884 22.6429 3.56319L21 5.40783L19.3571 3.56319C18.6023 2.71563 17.4914 2.2 16.149 2.2C14.2767 2.2 12.7 3.77638 12.7 5.775C12.7 7.01251 13.2245 8.32066 14.8353 10.2367C16.2355 11.9024 18.255 13.7985 21 16.3031ZM25.7136 21C28.2114 23.7456 30.1033 25.7626 31.7765 27.1604C33.6917 28.7603 35.0352 29.3 36.351 29.3C38.2233 29.3 39.8 27.7236 39.8 25.725C39.8 24.5319 39.3012 23.4127 38.4368 22.6429L36.5922 21L38.4368 19.3571C39.2844 18.6023 39.8 17.4914 39.8 16.149C39.8 14.2767 38.2236 12.7 36.225 12.7C34.9876 12.7 33.6796 13.2245 31.767 14.8344C30.1037 16.2344 28.2112 18.2543 25.7136 21Z'
        fill={color}
      />
    </Svg>
  )
}
