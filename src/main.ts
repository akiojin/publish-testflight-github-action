import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ArgumentBuilder } from '@akiojin/argument-builder';
import * as fs from 'fs/promises';
import path from 'path'

async function GenerateAPIKeyJSON(key: string, keyID: string, issuerID: string, isInHouse: boolean, outputDirectory: string): Promise<string>
{
    const APIKeyFileName = 'api-key.json'

    const json = JSON.stringify({
        "key_id": keyID,
        "issuer_id": issuerID,
        "in_house": isInHouse,
        "key": key
    })

    const outputPath = path.join(outputDirectory, APIKeyFileName)
    await fs.writeFile(outputPath, json)

    core.setOutput('output-path', outputPath)

    core.startGroup(`Generate ${APIKeyFileName}`)
    core.info(`APP_STORE_CONNECT_API_KEY_PATH=${outputPath}`)
    core.info(`${APIKeyFileName}:\n${json}`)
    core.endGroup()

    core.exportVariable('APP_STORE_CONNECT_API_KEY_PATH', outputPath)

    return outputPath
}

async function Run()
{
    try {
        const outputPath = core.getInput('api-key-path') || process.env['APP_STORE_CONNECT_API_KEY_PATH'] ||
            await GenerateAPIKeyJSON(
                core.getInput('key'),
                core.getInput('key-id'),
                core.getInput('issuer-id'),
                core.getBooleanInput('in-house'),
                core.getInput('output-directory'))

        const builder = new ArgumentBuilder()
            .Append('pilot', 'upload')
            .Append('--ipa', core.getInput('ipa-path'))
            .Append('--api_key_path', outputPath)

        core.startGroup('Run fastlane "pilot"')
        await exec.exec('fastlane', builder.Build())
        core.endGroup()
    } catch (ex: any) {
        core.setFailed(ex.message)
    }
}

Run()
