import path from 'path'
import fs from 'fs'
import { injectable } from 'inversify'
import { FatalError } from './Errors'
import { BotpressConfig } from './botpress.config'
import { ModulesConfig } from './modules.config'

export interface ConfigProvider {
  getBotpressConfig(): Promise<BotpressConfig>
  getModulesConfig(): Promise<ModulesConfig>
}

@injectable()
export class FileConfigProvider implements ConfigProvider {
  async getBotpressConfig(): Promise<BotpressConfig> {
    return this.getConfig<BotpressConfig>('botpress.config.json')
  }

  async getModulesConfig(): Promise<ModulesConfig> {
    return this.getConfig<ModulesConfig>('modules.config.json')
  }

  private async getConfig<T>(fileName: string): Promise<T> {
    const filePath = path.join(this.getRootDir(), fileName)

    if (!fs.existsSync(filePath)) {
      throw new FatalError(`Modules configuration file "${fileName}" not found at "${filePath}"`)
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      return <T>JSON.parse(content)
    } catch (e) {
      throw new FatalError(e, `Error reading modules configuration "${fileName}" at "${filePath}"`)
    }
  }

  private getRootDir(): string {
    return process.title === 'node' ? this.getDevConfigPath() : this.getBinaryConfigPath()
  }

  private getDevConfigPath() {
    return path.join(__dirname, '../config')
  }

  private getBinaryConfigPath() {
    return path.join(path.dirname(process.execPath), 'config')
  }
}
