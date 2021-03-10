# Carrier_PC

## 环境

- **Node 安装**

  Node 包下载 [https://nodejs.org/zh-cn](https://nodejs.org/zh-cn/)

  > `node` 版本建议大于 `12.0`

- **包管理工具 Yarn**

  安装：[https://yarn.bootcss.com/docs/install/#mac-stable(opens new window)](https://yarn.bootcss.com/docs/install/#mac-stable)

  > 建议使用 `yarn` 管理依赖来确保跨机器的安装一致性（项目中已经上传 `yarn.lock` 文件）。

* **编程工具 Visucal Studio Code**

  安装： https://code.visualstudio.com/



## 开发运行

- **开发运行**

  从远程仓库拉取最新代码后，用命令行模式 `cd` 进入 项目根目录并执行 `yarn install` 拉取项目依赖包

  > 如果 `yarn install` 速度太慢，可自行更换淘宝镜像

  命令行运行 `yarn run serve`启动项目开发环境（启动后访问地址：http://localhost:8080/）



## 部署

1. 运行 `yarn run build` 命令，生成打包文件（dist）包
2. 再拷贝 `dist` 文件夹下的内容到服务器对应的目录下（前端服务静态页面存放目录， 可放置于非根目录）
3. 在部署服务器访问地址 `http://localhost:port/` 查看


### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your end-to-end tests
```
yarn run test:e2e
```

### Run your unit tests
```
yarn run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
