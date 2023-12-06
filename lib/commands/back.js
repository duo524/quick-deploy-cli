const { NodeSSH } = require('node-ssh')
const { configPath } = require('../config')
const config = require(configPath)
const { error, succeed } = require('../utils/index')
const ssh = new NodeSSH()
const inquirer = require('inquirer')
const prodConfig = config.prod



// 连接服务器
const connectSSH = async () => {
    try {
        await ssh.connect({
            host: prodConfig.host,
            username: prodConfig.username,
            privateKeyPath: config.privateKey
        })
        succeed('ssh登录成功')
    } catch (e) {
        error(`ssh登录失败,您还没有部署过项目！ ${e}`)
        process.exit(1)
    }
}

// 解压备份文件
const unzipBackFile = async () => {
    const { bakDir, webDir } = prodConfig
    try {
        const { stdout } = await ssh.execCommand(`cat back.txt`, { cwd: webDir })
        if (stdout) {
            await ssh.execCommand('rm back.txt -f', { cwd: webDir })
            await ssh.execCommand(`unzip -o ${stdout} -d / && rm -rf /${bakDir.split('/')[1]}`, { cwd: '/' })
            succeed('解压备份文件成功')
        } else {
            error('没有可回滚的内容，回滚失败！')
            process.exit(1)
        }
    } catch (e) {
        error(`解压备份文件失败！${e}`)
        process.exit(1)
    }
}

const back = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `${config.projectName} 项目是否在生产环境回滚?`
        }
    ])
    if (answers.confirm) {
        await connectSSH()
        await unzipBackFile()
        ssh.dispose()
        succeed('项目已成功在生产环境回滚')
        process.exit(0)
    }

}
module.exports = {
    back
}