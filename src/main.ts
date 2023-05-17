import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ArgumentBuilder } from '@akiojin/argument-builder';
import * as fs from 'fs/promises';
import path from 'path'

const APIKeyFileName = 'api-key.json'

async function GenerateAPIKeyJSON(): Promise<string>
{
    const json = JSON.stringify({
        "key_id": core.getInput('key-id'),
        "issuer_id": core.getInput('issuer-id'),
        "key": core.getInput('key')
    })

    const outputPath = path.join(core.getInput('output-directory'), APIKeyFileName)
    await fs.writeFile(outputPath, json)

    core.startGroup(`Generate "${outputPath}"`)
    core.info(`${APIKeyFileName}:\n${json}`)
    core.endGroup()

    return outputPath
}

async function Run()
{
    try {
        const outputPath = core.getInput('api-key-path') || await GenerateAPIKeyJSON()

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
