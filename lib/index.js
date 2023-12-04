const { program } = require('commander')
const packageInfo = require('../package.json')
const { commandList } = require('./commands/index')


module.exports = class Service {
    constructor() {
        setDefaultCommands()
        registerCommands()
    }
    run() {
        program.parse(process.argv)
    }
}



const setDefaultCommands = () => {
    program.version(packageInfo.version, '-v, --version', '输出当前版本号')
    program.helpOption('-h, --help', '获取帮助')
}

const registerCommands = () => {
    commandList.forEach(item => {
        const programme = program.command(item.command).description(item.description).alias(item.alias)
        if (item.command === 'deploy') programme.option('-m, --mode <mode>', '部署环境')
        programme.action(options => item.apply(options.mode))
    })
}

