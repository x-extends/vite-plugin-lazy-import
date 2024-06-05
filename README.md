# vite-plugin-lazy-import

Used for vite Lazy import js and style.

## Installation

```shell
npm install vite-plugin-lazy-import -D
```

```javascript
// vite.config.ts
import { lazyImport } from 'vite-plugin-lazy-import'

export default defineConfig({
  // ...
  plugins: [
    lazyImport({
      resolvers: [
        {
          lib: 'vxe-pc-ui',
          importStyle: 'css', // import style '*.css'
          esm: true // import directory '/es/*' | '/lib/*'
        }
      ]
    })
  ]
  // ...
})
```

## Usage

```javascript
// main.ts
// ...
import { VxeUI, VxeButton } from 'vxe-pc-ui'
//...

VxeUI.setConfig({})

createApp(App).use(VxeButton).mount('#app')
```

into this

```javascript
// main.ts
// ...
import { VxeUI } from 'vxe-pc-ui/es/vxe-ui/index.js'
import { VxeButton } from 'vxe-pc-ui/es/vxe-button/index.js'
//...

VxeUI.setConfig({})

createApp(App).use(VxeButton).mount('#app')
```

## Lazy import js

```javascript
import { lazyImport } from 'vite-plugin-lazy-import'

lazyImport({
  resolvers: [
    {
      lib: 'vxe-pc-ui',
      resolve ({ name, dirName }) {
        return {
          from: `vxe-pc-ui/es/${dirName}/index.js`
        }
      }
    }
  ]
})
```

## Lazy import js and css

```javascript
import { lazyImport } from 'vite-plugin-lazy-import'

lazyImport({
  resolvers: [
    {
      lib: 'vxe-pc-ui',
      importStyle: true,
      resolve ({ name, dirName }) {
        return {
          from: {
            jsPath: `vxe-pc-ui/es/${dirName}/index.js`,
            stylePath: `vxe-pc-ui/es/${dirName}/style.css`
          }
        }
      }
    }
  ]
})
```

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
