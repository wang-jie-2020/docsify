## nodejs

```bash
# npm install --registry=https://registry.npm.taobao.org
npm install --registry=https://registry.npmmirror.com
```



### volta

```bash
# volta
curl https://get.volta.sh | bash
volta install node@22.5.1
volta install node
volta pin node@20.16
```



### 快速删除 node_modules

```bash
npm install -g rimraf 
rimraf node_modules
```



### web-storm

在旧版中点击import直接跳转，在2024版本中无法跳转，提示找不到，解决方式是在项目根目录下[文件：jsconfig.json]

```js
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  },
  "exclude": [
    "node_modules",
    "dist"
  ]
}

```

