# deploy-cli-service

前端快速部署脚手架服务，支持开发、测试、生产多环境配置

### github

[https://github.com/lovecallme/quick-deploy-cli](https://github.com/lovecallme/quick-deploy-cli)

### npm

[https://www.npmjs.com/package/quick-deploy-cli](https://www.npmjs.com/package/quick-deploy-cli)

## 1 安装

全局安装 quick-deploy-cli(推荐使用)

```shell
npm install quick-deploy-cli -g
```

本地安装 deploy-cli-service

```shell
npm install quick-deploy-cli -D
```

注：本地安装的需要在调用命令前加 `npx`

### 2 使用（以下示例都采用全局安装方式）

#### 2.1 查看版本

```shell
quick-deploy -v
```

#### 2.2 查看帮助

```shell
quick-deploy -h
```
#### 2.3 命令生成配置文件（在项目目录下）

```shell
quick-deploy init # 或者使用简写 quick-deploy i
```

#### 2.4 手动创建或修改配置文件

在项目根目录下手动创建 `quick-deploy.js` 文件，复制以下代码按情况修改即可。

```javascript
module.exports = {
  projectName: 'vue_samples', // 项目名称
  privateKey: 'C:/Users/86155/.ssh/id_rsa', //私钥地址
  // 部署环境可以指定多个
  prod: {
    name: '开发环境', // 环境名称
    script: 'npm run build', // 打包命令
    host: '192.168.132.32', // 服务器地址
    username: 'root', // 服务器登录用户名
    distPath: 'dist', // 本地打包生成目录
    webDir: '/www/dist', // 服务器部署路径
    bakDir: '/backup', // 备份路径 生产环境需指定,其他环境无需指定 (打包前备份之前部署目录 最终备份路径为 /backup/last-dist/dist.zip)
  },
  dev: {
    name: '开发环境', // 环境名称
    script: 'npm run build', // 打包命令
    host: '192.168.132.32', // 服务器地址
    username: 'root', // 服务器登录用户名
    distPath: 'dist', // 本地打包生成目录
    webDir: '/www/dist', // 服务器部署路径
    bakDir: '', // 备份路径 无需填写
  }
}
```

#### 2.5 部署 （在项目目录下）

注意：命令后面需要加 `--mode` 环境对象 （如：`--mode dev`）

```shell
quick-deploy deploy --mode dev # 或者使用 quick-deploy d --mode dev
```

生产环境需要输入 `Y` 确认，确认后开始部署，其他环境直接部署

#### 2.6 回滚 （在项目目录下）

```shell
quick-deploy back # 或者使用 quick-deploy -b
```

回滚只支持生产环境，回滚需要输入 `Y` 确认，确认后开始回滚


#### 2.7 注意事项
1. 生产环境必须使用 pord ，其他环境随意

如配置 test:{...} 部署时需要使用命令如下（配置其他环境模仿如下命令即可）：

```shell
quick-deploy deploy --mode test # 或者使用简写
```

2. 生产环境必须配置备份地址，否则无法备份以及回滚

3. 回滚只支持回滚一次无法多次回滚