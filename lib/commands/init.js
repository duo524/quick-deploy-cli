
const { info, hasConfig,succeed } = require('../utils/index')
const { inquirerConfig, configPath } = require('../config')
const inquirer = require('inquirer')
const fs = require('fs')
const { execSync } = require('child_process')


// 获取用户输入信息
const getUserInputInfo = () => {
    return inquirer.prompt(inquirerConfig)
}

// 创建JSON对象
const createJsonObj = (userInputInfo) => {
    const jsonObj = {
        projectName: userInputInfo.projectName,
        privateKey: userInputInfo.privateKey,
    }
    const deployEnv = userInputInfo.deployEnv
    jsonObj[deployEnv] = {
        name: userInputInfo[`${deployEnv}Name`],
        script: userInputInfo[`${deployEnv}Script`],
        host: userInputInfo[`${deployEnv}Host`],
        username: userInputInfo[`${deployEnv}Username`],
        password: userInputInfo[`${deployEnv}Password`],
        distPath: userInputInfo[`${deployEnv}DistPath`],
        webDir: userInputInfo[`${deployEnv}WebDir`],
        bakDir: userInputInfo[`${deployEnv}BakDir`],
    }
    return jsonObj
}

// 创建配置文件
const createConfigFile = (jsonObj) => {
    const str = `module.exports = ${JSON.stringify(jsonObj, null, 2)}`
    fs.writeFileSync(configPath, str)
}

// 格式化配置文件
const formatConfigFile = () => {
    execSync(`npx prettier --write ${configPath}`)
}

const init = async () => {
    if (hasConfig()) {
        info('quick-deploy.js 配置文件已存在')
        process.exit(0)
    }
    createConfigFile(createJsonObj(await getUserInputInfo()))
    formatConfigFile()
    succeed('配置文件生成成功，请查看项目目录下的 quick-deploy.js ')
    process.exit(0)
}

module.exports = {
    init
}