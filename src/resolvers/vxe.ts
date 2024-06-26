import { LazyImportResolver } from '../index'

export interface VxeResolverOptions {
  libraryName: 'vxe-pc-ui' | 'vxe-table',
  esm?: boolean
  importStyle?: boolean
}

export function VxeResolver (options: VxeResolverOptions): LazyImportResolver {
  const opts = Object.assign({ esm: true, importStyle: true }, options)
  return {
    esm: opts.esm,
    libraryName: opts.libraryName,
    importStyle: opts.importStyle,
    resolve ({ name, dirName }) {
      const libPath = `${opts.libraryName}/${opts.esm ? 'es' : 'lib'}`
      // 兼容老版本
      if (name === 'VXETable') {
        dirName = 'v-x-e-table'
      }
      if (opts.importStyle) {
        return {
          from: {
            jsPath: `${libPath}/${dirName}/index.js`,
            stylePath: `${libPath}/${dirName}/style.css`
          }
        }
      }
      return {
        from: `${libPath}/${dirName}/index.js`
      }
    }
  }
}
