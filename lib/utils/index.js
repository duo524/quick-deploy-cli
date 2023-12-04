const ora = require('ora')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const { configPath } = require('../config')

module.exports = {
    // 检查部署配置文件是否存在
    hasConfig: () => {
        return fs.existsSync(configPath)
    },
    // 成功信息
    succeed: (message) => {
        ora().succeed(chalk.greenBright.bold(message))
    },
    // 提示信息
    info: (message) => {
        ora().info(chalk.blueBright.bold(message))
    },
    // 错误信息
    error: (message) => {
        ora().fail(chalk.redBright.bold(message))
    },
}
