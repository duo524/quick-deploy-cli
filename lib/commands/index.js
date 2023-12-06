
const commandList = [
    {
        command: 'deploy',
        description: '部署项目',
        alias: 'd',
        apply: mode => require('./deploy').deploy(mode)
    },
    {
        command: 'init',
        description: '初始化配置',
        alias: 'i',
        apply: mode => require('./init').init(mode)
    },
    {
        command: 'back',
        description: '生产环境回滚代码',
        alias: 'b',
        apply: mode => require('./back').back()
    },
]


module.exports = {
    commandList
}