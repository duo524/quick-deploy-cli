const fs = require('fs')
const os = require('os')
const path = require('path')
const configPath = path.join(process.cwd(), 'quick-deploy.js')

module.exports = {
    inquirerConfig: [
        {
            type: 'input',
            name: 'projectName',
            message: '请输入项目名称',
            default: fs.existsSync(`${path.join(process.cwd())}/package.json`)
                ? require(`${process.cwd()}/package.json`).name
                : ''
        },
        {
            type: 'input',
            name: 'privateKey',
            message: '请输入本地私钥地址',
            default: `${os.homedir()}/.ssh/id_rsa`
        },
        {
            type: 'password',
            name: 'passphrase',
            message: '请输入本地私钥密码',
            default: ''
        },
        {
            type: 'input',
            name: 'deployEnv',
            message: '请输入需要部署的环境',
            default: 'prod'
        },
        {
            type: 'input',
            name: 'prodName',
            message: '环境名称',
            default: '生产环境',
        },
        {
            type: 'input',
            name: 'prodScript',
            message: '打包命令',
            default: 'npm run build:prod',
        },
        {
            type: 'input',
            name: 'prodHost',
            message: '服务器地址',
        },
        {
            type: 'number',
            name: 'prodPort',
            message: '服务器端口号',
            default: 22,
        },
        {
            type: 'input',
            name: 'prodUsername',
            message: '用户名',
            default: 'root',
        },
        {
            type: 'password',
            name: 'prodPassword',
            message: '密码',
        },
        {
            type: 'input',
            name: 'prodDistPath',
            message: '本地打包目录',
            default: 'dist',
        },
        {
            type: 'input',
            name: 'prodWebDir',
            message: '部署路径',
        },
        {
            type: 'input',
            name: 'prodBakDir',
            message: '备份路径',
        },
        {
            type: 'confirm',
            name: 'prodIsRemoveRemoteFile',
            message: '是否删除远程文件',
            default: true,
        },
        {
            type: 'confirm',
            name: 'prodIsRemoveLocalFile',
            message: '是否删除本地打包文件',
            default: true,
        }
    ],
    configPath
}