import { Plugin, FilterPattern } from 'vite'
import { parse } from 'es-module-lexer'
import { createFilter } from '@rollup/pluginutils'
import XEUtils from 'xe-utils'

export interface LazyImportResolverResult {
  from: string | {
    jsPath: string
    stylePath: string
  }
}

export interface LazyImportResolver {
  libraryName: string
  esm?: boolean
  importStyle?: boolean | 'css' | 'less' | 'scss'
  resolve?: (params: {
    dirName: string
    name: string
    libraryName: string
  }) => null | LazyImportResolverResult
}

export interface LazyImportConfig {
  include?: FilterPattern
  exclude?: FilterPattern
  resolvers: LazyImportResolver[]
}

export function lazyImport (options: LazyImportConfig): Plugin<any> {
  const opts: LazyImportConfig = Object.assign({
    include: ['**/*.vue', '**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx']
    //  exclude :["node_modules/**"]
  }, options)
  const filter = createFilter(opts.include, opts.exclude)

  const parseMaps: Record<string, any> = {}

  function parseResolverImport (code: string, resOpts: LazyImportResolver) {
    const [imports] = parse(code)
    for (let i = 0; i < imports.length; i++) {
      const item = imports[i]
      if (item.n === resOpts.libraryName) {
        return item
      }
    }
    return null
  }

  function transformImport (id:string, syntaxCode: string, resOpts: LazyImportResolver) {
    const importVariables = syntaxCode.split(',').map(name => name.trim())
    const importCodes: string[] = []
    importVariables.forEach(name => {
      const asRest = name.match(/([a-zA-Z0-9_]+)\s+as\s+([a-zZ-Z0-9_]+)/)
      let importName = name
      if (asRest) {
        importName = asRest[1]
      }

      let jsPath = ''
      let stylePath = ''
      const parseItem = parseMaps[`${id}_${importName}`]
      if (parseItem) {
        jsPath = parseItem.jsPath
        stylePath = parseItem.stylePath
      } else {
        const libDir = resOpts.esm ? 'es' : 'lib'
        const extName = resOpts.importStyle === true ? 'css' : (resOpts.importStyle || 'css')
        const dirName = XEUtils.kebabCase(importName)
        jsPath = `import { ${name} } from "${resOpts.libraryName}/${libDir}/${dirName}/index.js"`
        stylePath = `import "${resOpts.libraryName}/${libDir}/${dirName}/style.${extName}"`
        if (resOpts.resolve) {
          const rest = resOpts.resolve({
            dirName,
            name: importName,
            libraryName: resOpts.libraryName
          })
          const fromRest = rest ? rest.from : null
          if (fromRest) {
            if (XEUtils.isString(fromRest)) {
              jsPath = `import { ${name} } from "${fromRest}"`
            } else {
              if (fromRest.jsPath) {
                jsPath = `import { ${name} } from "${fromRest.jsPath}"`
              }
              if (fromRest.stylePath) {
                stylePath = `import "${fromRest.stylePath}"`
              }
            }
          }
        }
        parseMaps[`${id}_${importName}`] = {
          jsPath,
          stylePath
        }
      }
      if (resOpts.importStyle) {
        importCodes.push(`${jsPath};\n${stylePath}`)
        return
      }
      importCodes.push(`${jsPath}`)
    })
    return importCodes.join(';\n')
  }

  return {
    name: 'vite:lazy-import',
    enforce: 'post',
    transform (code, id) {
      if (!code || !filter(id) || !Array.isArray(opts.resolvers)) {
        return null
      }
      let isTransform = false
      let restCode = code
      opts.resolvers.forEach(resolver => {
        const resOpts = Object.assign({}, resolver)
        if (!resOpts.libraryName) {
          return
        }
        const syntaxItem = parseResolverImport(restCode, resOpts)
        if (!syntaxItem) {
          return
        }
        const importRE = new RegExp(`^import\\s+\\{(\\s+)?([a-zA-Z0-9,_\\s]+)\\}(\\s+)?from\\s+('|")${resOpts.libraryName}('|")`)
        const matchRest = restCode.slice(syntaxItem.ss, syntaxItem.se).replace(/\n/g, ' ').match(importRE)
        if (!matchRest) {
          return
        }
        const importCode = transformImport(id, matchRest[2], resOpts)
        isTransform = true
        restCode = `${restCode.slice(0, syntaxItem.ss)}${importCode}${restCode.slice(syntaxItem.se)}`
      })
      if (isTransform) {
        return {
          code: restCode
        }
      }
      return null
    }
  }
}

export * from './resolvers'
