const { error, hasConfig, succeed } = require('../utils/index')
const { exec } = require('child_process')
const inquirer = require('inquirer')
const { configPath } = require('../config')
const config = require(configPath)
const ora = require('ora')
const fs = require('fs')
const archiver = require('archiver')
const { NodeSSH } = require('node-ssh')


const ssh = new NodeSSH()
// 检查环境是否正确
const checkEnvCorrect = (config, mode) => {
    const keys = ['name', 'host', 'port', 'username', 'distPath', 'webDir', 'script']

    if (config) {
        keys.forEach((key) => {
            if (!config[mode][key] || config[mode][key] === '') {
                error(`配置错误: ${mode}环境 ${key}属性配置不正确`)
                process.exit(1)
            }
        })
    } else {
        error('配置错误: 未指定部署环境或指定部署环境不存在')
        process.exit(1)
    }
}

// 是否确认部署
const confirmDeploy = (message) => {
    return inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message
        }
    ])
}

// 执行任务列表
const execTaskList = async (envConfig, mode) => {
    try {
        await build(envConfig)
        await buildZip(envConfig)
        await connectSSH(envConfig)
        await uploadLocalFile(envConfig)
        if (mode === 'prod') await backupRemoteFile(envConfig)
        await unzipRemoteFile(envConfig)
        ssh.dispose()
        succeed(`项目已在${envConfig.name}部署成功！`)
        process.exit(0)

    } catch (e) {
        error(`部署失败 ${e}`)
        process.exit(1)
    }

}

// 打包
const build = async (envConfig) => {
    const spinner = ora({ prefixText: `${envConfig.script}:正在打包中，请耐心等待`, spinner: 'timeTravel' }).start()
    try {
        await new Promise((resolve, reject) => {
            exec(envConfig.script, (e) => {
                if (e === null) {
                    spinner.stop()
                    succeed('打包成功')
                    resolve()
                } else {
                    reject(e.message)
                }
            })
        })
    } catch (e) {
        spinner.stop()
        error(`打包失败 ${e}`)
        process.exit(1)
    }
}

// 打包Zip
const buildZip = async (envConfig) => {
    await new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } }).on('error', e => error(e))
        const output = fs.createWriteStream(`${process.cwd()}/${envConfig.distPath}.zip`)
        output.on('close', () => {
            succeed(`${envConfig.distPath}.zip 压缩成功`)
            resolve()
        })
        archive.on('error', (e) => {
            error(`zip压缩失败: ${e}`)
            reject(e)
            process.exit(1)
        })
        archive.pipe(output)
        archive.directory(envConfig.distPath, false)
        archive.finalize()
    })
}

// 连接ssh
const connectSSH = async (envConfig) => {
    const { host, username, privateKey } = envConfig
    try {
        await ssh.connect({
            host,
            username,
            privateKeyPath: privateKey
        })
    } catch (e) {
        try {
            const answers = await inquirer.prompt([
                {
                    type: 'password',
                    name: 'password',
                    message: '请输入服务器密码'
                }
            ])

            await ssh.connect({ password: answers.password, username, host })

            const { code } = await ssh.execCommand('[ ! -d /ssh ]')

            if (code === 0) {

                await ssh.putFile(`${privateKey}.pub`, '/ssh/id_rsa.pub')

                await ssh.execCommand('cat /ssh/id_rsa.pub >> ~/.ssh/authorized_keys')

                await ssh.execCommand('rm -rf /ssh')
            }

        } catch (err) {
            error(`登录失败或上传公钥到服务器失败: ${err}`)
            process.exit(1)
        }
    }
}

// 上传本地文件
const uploadLocalFile = async (envConfig) => {
    try {
        const localFileName = `${envConfig.distPath}.zip`
        const remoteFileName = `${envConfig.webDir}.zip`
        const localPath = `${process.cwd()}/${localFileName}`

        const spinner = ora({ prefixText: `正在上传压缩包，请耐心等待`, spinner: 'timeTravel' })

        spinner.start()

        await ssh.putFile(localPath, remoteFileName)
        fs.unlinkSync(`${process.cwd()}/${localFileName}`)
        spinner.stop()
        succeed('上传压缩包成功')
    } catch (e) {
        error(`上传压缩包失败: ${e}`)
        process.exit(1)
    }
}


// 备份远程文件
const backupRemoteFile = async (envConfig) => {
    try {
        const { webDir, bakDir } = envConfig
        const { code } = await ssh.execCommand(`[ ! -d ${bakDir} ]`)
        if (code === 0) {
            await ssh.execCommand(`mkdir ${bakDir} -p`)
        } else {
            await ssh.execCommand(`[rm -rf ${bakDir}] && mkdir ${bakDir} -p`)
        }
        await ssh.execCommand(`zip -q -r ${bakDir}/last-dist ${webDir}`)

        succeed(`备份成功 备份至 ${bakDir}/last-dist`)
    } catch (e) {
        error(e)
        process.exit(1)
    }
}

// 解压远程文件
const unzipRemoteFile = async (envConfig) => {
    try {
        const { webDir } = envConfig

        const remoteFileName = `${webDir}.zip`

        await ssh.execCommand(`unzip -o ${remoteFileName} -d ${webDir} && rm -r ${remoteFileName}`)

        succeed('解压成功')
    } catch (e) {
        error(e)
        process.exit(1)
    }
}

const deploy = async (mode) => {
    if (!mode) {
        error('请使用 -m 或 --mode 给 quick-deploy deploy 命令指定部署环境')
        process.exit(1)
    }
    if (hasConfig()) {
        checkEnvCorrect(config, mode)
        const envConfig = {
            ...config[mode],
            privateKey: config.privateKey,
            passphrase: config.passphrase,
            readyTimeout: config.readyTimeout
        }
        if (mode === 'prod') {
            const answers = await confirmDeploy(`${config.projectName} 项目是否部署到 ${envConfig.name}?`)
            if (answers.confirm) await execTaskList(envConfig, mode)
        } else {
            await execTaskList(envConfig, mode)
        }
    } else {
        error('quick-deploy.js 配置文件不存在，请使用 quick-deploy init 命令创建')
        process.exit(1)
    }
}

module.exports = {
    deploy
}
