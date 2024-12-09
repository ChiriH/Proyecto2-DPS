import { extendTheme } from 'native-base';

// Definición del tema
const theme = extendTheme({
  colors: {
    primary: {
      50: '#e3f2f9',
      100: '#c5e4f3',
      200: '#a2d4ec',
      300: '#7ac1e4',
      400: '#47a9da',
      500: '#0088cc',
      600: '#007ab8',
      700: '#006ba1',
      800: '#005885',
      900: '#003f5e',
    },
    secondary: {
      50: '#f9eaf3',
      100: '#f3d1e4',
      200: '#e6a8c8',
      300: '#d97eaa',
      400: '#cb5290',
      500: '#b33474',
      600: '#90285b',
      700: '#701d45',
      800: '#50122f',
      900: '#330a1a',
    },
    neutral: {
      50: '#f9f9f9',
      100: '#f2f2f2',
      200: '#e4e4e4',
      300: '#d6d6d6',
      400: '#c8c8c8',
      500: '#aaaaaa',
      600: '#8c8c8c',
      700: '#6e6e6e',
      800: '#4f4f4f',
      900: '#313131',
    },
  },
  fonts: {
    heading: 'Roboto-Bold',
    body: 'Roboto-Regular',
    mono: 'Roboto-Mono',
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
        _text: { fontWeight: 'bold', color: 'white' },
        _pressed: { opacity: 0.8 },
      },
      defaultProps: {
        colorScheme: 'primary',
      },
    },
    Input: {
      baseStyle: {
        borderColor: 'neutral.300',
        borderRadius: 'md',
        _focus: { borderColor: 'primary.500', borderWidth: 2 },
      },
    },
    Text: {
      baseStyle: {
        color: 'neutral.900',
        fontSize: 'md',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        color: 'primary.500',
        marginBottom: 2,
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;
