## Pages

github上面向个人的,静态站点,免费部署,在repository的setting>pages中可以配置将某个分支作为静态内容发布.

实际上它也是一个github action.由bot自动发起流程.

## Action

github上的ci/cd,和gitlab runner有类似之处,功能更加丰富.

简单的打包镜像的Action示例:

```yaml
name: Docker Image CI	# workflow的名称,显示用

on:
  push:
    branches: [ "main" ]	# main分支的push动作触发
  pull_request:
    branches: [ "main" ]	# main分支的pull request动作触发

jobs:

  build:	#一套部署动作,如果有前置动作,则needs: [Name]

    runs-on: ubuntu-latest	#环境

    steps:	#步骤
    - uses: actions/checkout@v3	#导入前置动作,也就是一套run动作,可以查阅仓库
    - name: Build the Docker image	
      run: docker build . --file Dockerfile --tag wangjie_docs:$(date +%s)
```

## vuepress的部署过程

将vuepress项目通过action发布至page,[vuepress](https://vuepress.vuejs.org/),文档中实际上包含了此种部署模式的详细介绍.

1. page基于gh-pages分支,故action中需要有推送权限
   1. github中setting>personal access tokens>tokens增加新的token
2. 上述token增加至repository>secrets>actions中的变量
3. 参考https://github.com/JamesIves/github-pages-deploy-action

```yaml
name: Build and Deploy
permissions:
  contents: write
on:
  push:
    branches:
      - main
jobs:
  deploy:
    concurrency: ci-${{ github.ref }} # Recommended if you intend to make multiple deployments in quick succession.
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Setup Node 🧂	# 项目需要指定node版本
        uses: actions/setup-node@v3
        with:
          node-version: '14.20.0'

      - name: Install and Build 🔧 
        run: |
          npm install 
          npm run build

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          ACCESS_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
          BRANCH: gh-pages
          folder: ./.vuepress/dist
          clean: true
          clean-exclude: |
            special-file.txt
            some/*.txt
```

