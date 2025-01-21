export default {
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {},
    'postcss-nested': {},
    autoprefixer: {},
    cssnano: process.env.NODE_ENV == 'production' ? {} : false
  }
}
