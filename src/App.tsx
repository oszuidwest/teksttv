import { useCallback, useEffect, useState } from 'react'

interface Slide {
  type: 'image' | 'text'
  duration: number
  title: string
  body: string
  image: string
  url: string
}

interface TickerItem {
  message: string
}

const TextSlide = ({ content }: { content: Slide }) => (
  <div className="relative h-full w-full bg-[#BBBBBB] font-tahoma">
    <div className="sidebar absolute inset-0 inset-y-0 left-0 z-10 w-[604px] bg-[#F7BF19]">
      <img src={content.image} alt="" className="inset-0 h-full object-cover" />
    </div>
    <svg
      className="absolute inset-0 z-5 h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="slantedGradient"
          x1="31%"
          y1="0%"
          x2="35%"
          y2="0.276%"
        >
          <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#slantedGradient)" />
    </svg>

    <div className="absolute absolute inset-0 flex flex-col">
      <div className="z-20 mt-[92px] w-full bg-[#626671] px-[116px] py-[14px]">
        <h1 className="font-bold text-[51px] text-shadow text-white uppercase tracking-wide">
          {content.title}
        </h1>
      </div>
      <div className="relative mt-[12px] mb-[92px] grow overflow-hidden bg-[#70747D] px-[116px] pl-[602px]">
        <svg
          viewBox="0 0 1280 1130"
          className="absolute right-[64px] bottom-[30px] h-auto w-[640px] fill-[#ffff00] opacity-20"
        >
          <polygon
            id="Fill-2"
            fill="#F8E82B"
            points="691.999962 95.9999743 724.99996 95.9999743 746.999958 97.9999741 771.999956 101.999973 795.999984 107.999972 816.999952 114.999973 842.99992 125.999972 863.999978 136.999971 879.999947 146.999966 892.999916 155.999969 906.999975 166.999968 921.999944 179.999967 940.999942 198.999966 949.999941 209.999957 957.999941 219.999956 969.99994 236.999963 982.999939 258.999961 990.999938 274.99996 999.999937 295.999958 1008.99994 322.999936 1014.99994 347.999954 1018.99994 373.999952 1019.99994 384.999951 1019.99994 433.999917 1015.99994 464.999944 1009.99994 490.999912 998.999937 523.999909 989.999938 543.999908 977.999939 566.999936 965.99994 585.999934 953.999941 601.999933 942.999942 614.999932 930.999943 627.999931 916.999944 641.99993 894.999946 659.999928 870.999948 675.999927 852.999949 685.999926 827.999951 697.999925 805.999953 705.999924 780.999955 712.999924 754.999957 717.999923 727.99999 720.999923 689.999963 720.999923 668.999964 718.999863 644.999946 714.999924 620.999968 708.999924 596.99997 700.999925 571.999972 689.999926 552.999974 679.999927 533.999975 667.999928 515.999977 654.999929 500.999978 641.99993 490.999979 632.99993 479.99998 621.999931 472.99998 613.999932 459.999981 597.999933 449.999986 583.999934 436.999983 562.999906 428.999984 547.999907 419.999985 527.999909 412.999985 508.999941 405.999986 484.999943 400.999986 461.999914 397.999987 440.999946 396.999987 427.999947 396.999987 389.99995 398.999986 367.999952 403.999986 339.999954 410.999985 313.999956 417.999985 293.999958 426.999984 273.99996 434.999983 257.999961 445.999987 238.999963 453.999982 227.999964 463.999981 213.999957 476.99998 198.999966 487.999979 186.999959 495.999978 178.999968 503.99997 171.999968 519.999985 158.999969 533.999975 148.99997 546.999974 140.999967 560.999973 132.999971 575.999972 124.999972 602.99997 113.999973 628.999968 105.999972 655.999965 99.999974 678.999964 96.9999742"
          />
          <path
            d="M26.000022,438.999956 L97.0000792,439.999956 L97.0000862,442.999956 L98.0001011,473.999956 L101.000094,504.999956 L107.000093,540.999956 L114.000116,569.999976 L122.000099,596.999974 L131.000152,622.999971 L143.000151,651.999969 L150.000136,665.999967 L158.00015,682.999966 L165.000135,694.999956 L171.000181,705.999994 L186.00018,730.999992 L197.000189,746.999991 L210.000268,764.999989 L221.000237,778.999988 L230.000246,790.000017 L242.000185,803.999986 L260.000184,824.000015 L283.000312,846.999983 L283.999942,847.999923 L285.999942,849.499922 L289.000282,851.999982 L296.000311,858.999982 L307.00031,867.999981 L317.000339,876.99998 L327.000338,884.99998 L348.000337,900.999978 L368.000365,915.000007 L388.000363,928.000006 L403.000362,936.999975 L424.0003,949.000004 L451.000478,963.000033 L481.000416,977.000032 L514.000443,990.000031 L550.0005,1002.00003 L575.000558,1009.00003 L604.000556,1016.00003 L636.000673,1022.00003 L666.000491,1026.00003 L704.000488,1029.00003 L731.000245,1030.00003 L731.000245,1129.99996 L679.49988,1128.99996 L679.00073,1129.00002 L649.000552,1126.00002 L609.000375,1120.00002 L579.000498,1114.00002 L531.000442,1102.00002 L496.000295,1091.00002 L461.000387,1078.00002 L437.000449,1068.00002 L414.000421,1058.00003 L398.000233,1050.00003 L371.000235,1036.00003 L347.000397,1022.00003 L324.000279,1008.00003 L299.000311,991.000031 L280.000282,977.000032 L267.000243,967.000033 L251.000235,953.999974 L240.000236,944.999975 L227.000207,932.999976 L219.000297,926.000006 L212.000188,918.999977 L204.000188,911.999977 L189.00013,897.000009 L182.00018,889.000009 L174.000151,880.99998 L167.000195,872.999981 L155.000165,858.999982 L144.000136,845.999983 L137.000152,837.000013 L125.000115,820.999985 L115.000123,806.999986 L101.000094,785.999988 L86.0000801,761.99999 L70.0000584,732.999992 L54.0000437,700.999995 L39.0000419,664.999968 L28.0000248,634.99997 L19.0000166,605.999973 L10.0000077,569.999976 L2.99999512,531.999971 L-4.87500006e-06,508.999956 L-4.87500006e-06,484.999956 L0.205501168,438.999956 L26.000022,438.999956 Z M1167.49991,754.999927 L1170.00247,756.999806 L1181.00253,765.999812 L1194.49997,777.999805 L1202.94528,785.942583 L1211.00003,793.499836 L1208.00241,796.999809 L1197.00247,808.99985 L1182.00247,824.999837 L1172.00253,833.999851 L1155.00247,849.999873 L1144.00242,858.999865 L1128.00242,871.999848 L1109.00236,885.999885 L1090.00193,898.999869 L1071.00193,910.999853 L1054.002,920.999806 L1036.00187,930.999822 L1004.00194,946.999911 L968.001759,961.999927 L937.001702,972.999909 L903.001645,982.999888 L874.001217,989.999878 L835.00125,996.999937 L802.001193,1000.99989 L777.001225,1002.99989 L748.001287,1003.99977 L733.001259,1003.99977 L691.001022,1001.99991 L654.000875,997.999907 L613.000908,990.999958 L579.000661,982.999888 L554.000653,975.999889 L518.000516,963.99996 L488.000457,951.999961 L460.00033,938.999862 L440.000309,928.999863 L417.000317,915.999853 L396.000171,902.999869 L371.0001,885.999885 L358.000044,875.999848 L344.000005,864.999865 L334.499981,857.999872 L336.999981,854.999858 L349.000017,840.999851 L372.50007,811.499827 L376.000146,813.999838 L393.000151,826.999845 L407.000212,836.999806 L422.000241,846.999843 L443.000308,859.999872 L464.000307,871.999848 L487.000457,883.999885 L517.000526,897.999884 L540.000634,906.999868 L562.000663,914.999868 L596.00063,924.999853 L626.000907,931.999852 L661.000935,937.999832 L690.000992,940.999892 L701.001051,941.999802 L731.001289,942.999971 L759.001287,942.999971 L793.001254,940.999892 L826.001191,936.999852 L855.001219,931.999852 L885.001766,924.999853 L912.001704,916.999838 L947.001641,904.9999 L973.001759,893.999854 L1006.00194,877.999841 L1030.00187,864.999865 L1049.00187,852.999866 L1067.00193,840.999851 L1081.002,830.999837 L1094.00206,820.999837 L1110.00236,807.999839 L1121.00248,797.999816 L1129.00242,790.999832 L1156.49991,764.499856 L1167.49991,754.999927 Z M1279.99986,380.999974 L1279.55064,427.999974 L1279.57499,427.999974 L1279.00102,433.000042 L1277.00096,454.000067 L1271.00084,487.000111 L1261.00102,527.00016 L1248.00096,565.000219 L1238.00084,589.000247 L1227.00108,613.000275 L1216.00087,634.000304 L1200.00069,661.000352 L1187.00075,680.00035 L1173.00066,699.000408 L1160.00075,715.000437 L1151.00078,725.000436 L1144.0006,733.000436 L1132.0006,746.000465 L1122.00066,756.000464 L1114.00057,763.000493 L1107.00066,770.000493 L1099.00072,777.000522 L1086.00055,788.000521 L1072.00058,799.00052 L1054.00058,812.000549 L1033.00046,826.000578 L1013.00031,838.000577 L989.000404,851.000606 L964.000416,863.000605 L932.000378,876.000634 L896.000302,888.000633 L867.000212,896.000662 L833.000177,903.000662 L807.000095,907.000661 L777.000037,910.000661 L759.000013,911.000661 L729.999965,911.000661 L728.999965,910.000661 L729.999965,860.000605 L730.999965,851.000606 L765.000023,850.000606 L798.000089,847.000576 L824.000102,843.000577 L860.000183,835.000577 L891.000242,826.000578 L921.000259,815.000549 L946.000327,804.00052 L963.000326,796.000521 L985.000374,784.000492 L1006.00043,771.000493 L1025.00043,758.000464 L1041.00049,746.000465 L1052.00049,737.000435 L1065.0004,726.000436 L1080.00064,712.000407 L1098.00066,694.000379 L1105.00078,686.00038 L1118.00082,671.000351 L1131.00045,654.000322 L1145.00082,634.000304 L1156.00075,616.000295 L1166.00054,599.000247 L1174.00069,583.000228 L1184.00072,561.0002 L1194.00082,535.000176 L1202.00078,511.000147 L1210.00075,481.000103 L1216.00087,450.000061 L1220.00084,421.000028 L1223.00093,380.999974 L1279.99986,380.999974 Z M1068.99995,60.9999957 L1071.99995,63.4999957 L1082.00012,71.9999957 L1094.00012,85.9999727 L1105.00012,100.000031 L1117.00011,116.999972 L1129.00012,136.000043 L1137.00012,148.999996 L1145.00013,164.999926 L1155.00013,186.000116 L1167.00011,217.000014 L1176.00014,245.999961 L1182.00012,269.999899 L1187.00015,297.000376 L1191.00012,329.000314 L1192.00014,345.000123 L1192.00014,394.000029 L1190.00014,419.000147 L1186.00014,446.999784 L1181.00015,472.999812 L1173.00014,502.99972 L1164.00012,529.000508 L1153.00013,555.000535 L1140.00011,582.000383 L1126.00013,606.000261 L1115.00012,624.00001 L1107.00014,635.000129 L1097.00013,649.000188 L1086.00012,663.000127 L1075.99995,674.999636 L1073.00012,673.000186 L1062.00011,664.000127 L1052.00011,655.000187 L1044.00011,648.000188 L1028.99995,635.000069 L1032.00011,631.000069 L1043.00011,619.00001 L1056.00011,602.000132 L1070.00012,582.000383 L1082.00012,561.000505 L1088.00013,551.000506 L1100.00013,525.000508 L1110.00011,498.99984 L1119.00012,469.999722 L1125.00014,443.000055 L1129.00012,419.000147 L1131.0001,397.999968 L1132.00013,380.999996 L1132.00013,354.000092 L1130.00014,328.000314 L1126.00013,300.000266 L1120.00011,270.999919 L1113.00011,245.999961 L1102.00013,217.000014 L1090.00012,192.000092 L1079.00012,170.999888 L1067.00011,152.000019 L1055.00011,135.000028 L1046.00011,123.000086 L1035.00011,108.999981 L1030.68037,104.268028 L1034.00011,100.000031 L1041.00011,91.0000293 L1053.00011,77.0000116 L1067.00011,62.9999957 L1068.99995,60.9999957 Z M772.999946,0.163514285 L801.999928,4.00000057 L827.999919,9.99999748 L853.999909,17.9999998 L875.999892,25.9999872 L902.999871,37.9999862 L925.999869,50.9999851 L941.999858,60.9999843 L954.999857,69.9999726 L967.999835,79.9999718 L980.999834,90.9999709 L992.999853,102 L1015.99982,124.999976 L1024.99982,135.999975 L1037.99982,151.999974 L1053.99982,175.99996 L1065.99979,196.999938 L1073.99982,211.999907 L1083.99982,234.999955 L1093.99979,262.999923 L1101.99978,291.99998 L1106.99978,317.999948 L1109.99978,339.999947 L1111.99978,373.999914 L1111.99978,381.999943 L1110.99978,382.999973 L1052.99982,382.999973 L1052.99982,380.999913 L1049.99982,345.999976 L1044.99982,315.999948 L1037.99982,287.999951 L1028.99982,260.999953 L1017.99982,235.999905 L1007.99982,216.999937 L996.999823,199.999938 L984.999854,182.999969 L970.999835,165.999973 L955.999866,149.999974 L941.999858,136.999959 L927.999859,125.999991 L909.99987,112.999969 L884.999891,97.9999853 L860.999893,85.9999713 L834.999918,75.9999801 L808.999927,67.9999727 L780.999942,61.9999812 L757.999953,58.9999695 L734.999965,56.9999586 L734.999965,55.9999817 L735.499965,19.9999997 L735.944559,0.163514285 L772.999946,0.163514285 Z"
            id="Combined-Shape"
            fill="#00B4EE"
          />
        </svg>
        <div
          className="prose relative py-[14px] font-bold text-[49px] text-shadow text-white leading-[1.23em]"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </div>
  </div>
)

const ImageSlide = ({ content }: { content: Slide }) => (
  <div className="relative z-40 h-full w-full bg-black">
    <img src={content.url} alt="" className="h-full w-full object-cover" />
  </div>
)

const Clock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return <span>{formatTime(time)}</span>
}

const Ticker = ({
  items,
  currentIndex,
}: { items: TickerItem[]; currentIndex: number }) => {
  if (items.length === 0) return null

  return (
    <div className="absolute right-0 bottom-[91px] left-0 z-30 flex items-center bg-black font-bold font-tahoma text-[#F7BF19] text-[51px] tracking-wide">
      <span className="grow pl-[121px]">{items[currentIndex].message}</span>
      <div className="relative w-[10px] self-stretch">
        <svg
          className="h-full w-full fill-white"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon points="0,100 100,0 100,100" />
        </svg>
      </div>
      <span className="bg-white pr-[110px] pl-[30px] text-[56px] text-black">
        <Clock />
      </span>
    </div>
  )
}

function App() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [nextSlides, setNextSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([])
  const [nextTickerItems, setNextTickerItems] = useState<TickerItem[]>([])
  const [tickerIndex, setTickerIndex] = useState(0)
  const [imagesToPreload, setImagesToPreload] = useState<string[]>([])

  const fetchData = useCallback(async (isInitialLoad: boolean) => {
    try {
      const [slidesResponse, tickerResponse] = await Promise.all([
        fetch('https://cms.tv-krant.nl/wp-json/zw/v1/teksttv-slides'),
        fetch('https://cms.tv-krant.nl/wp-json/zw/v1/teksttv-ticker'),
      ])
      const newSlides = await slidesResponse.json()
      const newTickerItems = await tickerResponse.json()

      const imageUrls = [
        ...new Set(
          newSlides
            .flatMap(
              (slide: {
                image: string | undefined
                url: string | undefined | undefined
              }) => [slide.image, slide.url],
            )
            .filter(Boolean),
        ),
      ] as string[]

      if (isInitialLoad) {
        setSlides(newSlides)
        setTickerItems(newTickerItems)
        setImagesToPreload(imageUrls)
      } else {
        setNextSlides(newSlides)
        setNextTickerItems(newTickerItems)
        setImagesToPreload((prevUrls) => [
          ...new Set([...prevUrls, ...imageUrls]),
        ])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [])

  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  useEffect(() => {
    const fetchInterval = setInterval(
      () => {
        fetchData(false)
      },
      slides.length > 0 ? 5 * 60 * 1000 : 60 * 1000,
    )

    return () => clearInterval(fetchInterval)
  }, [fetchData, slides.length])

  useEffect(() => {
    if (slides.length === 0) return

    const timer = setInterval(() => {
      // @ts-ignore
      if (document.startViewTransition) {
        // @ts-ignore
        document.startViewTransition(() => {
          setCurrentSlide((prevSlide) => {
            const nextSlide = (prevSlide + 1) % slides.length
            if (nextSlide === 0 && nextSlides.length > 0) {
              setSlides(nextSlides)
              setNextSlides([])
              return 0
            }
            return nextSlide
          })

          setTickerIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % tickerItems.length
            if (nextIndex === 0 && nextTickerItems.length > 0) {
              setTickerItems(nextTickerItems)
              setNextTickerItems([])
              return 0
            }
            return nextIndex
          })
        })
      } else {
        // Fallback for browsers that don't support startViewTransition
        setCurrentSlide((prevSlide) => {
          const nextSlide = (prevSlide + 1) % slides.length
          if (nextSlide === 0 && nextSlides.length > 0) {
            setSlides(nextSlides)
            setNextSlides([])
            return 0
          }
          return nextSlide
        })

        setTickerIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % tickerItems.length
          if (nextIndex === 0 && nextTickerItems.length > 0) {
            setTickerItems(nextTickerItems)
            setNextTickerItems([])
            return 0
          }
          return nextIndex
        })
      }
    }, slides[currentSlide].duration)

    return () => clearInterval(timer)
  }, [slides, currentSlide, nextSlides, tickerItems, nextTickerItems])

  if (slides.length === 0) {
    return <div>Loading...</div>
  }

  const CurrentSlideComponent =
    slides[currentSlide].type === 'image' ? ImageSlide : TextSlide

  return (
    <div className="relative h-[1080px] w-[1920px]">
      {imagesToPreload.map((url) => (
        <link key={url} rel="preload" as="image" href={url} />
      ))}
      <CurrentSlideComponent
        key={currentSlide}
        content={slides[currentSlide]}
      />
      <Ticker items={tickerItems} currentIndex={tickerIndex} />
    </div>
  )
}

export default App
