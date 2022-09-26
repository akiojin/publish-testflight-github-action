import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ArgumentBuilder } from '@akiojin/argument-builder';
import * as fs from 'fs/promises';

async function Run()
{
    try {
        const apiKeyPath = core.getInput('api-key-path') || './api-key.p8'

        if (core.getInput('api-key-base64') != null) {
            await fs.writeFile(apiKeyPath, Buffer.from(core.getInput('api-key-base64'), 'base64'))
        }

        const apiKey = `{\"key_id\": \"${core.getInput('key-id')}\", \"issuer_id\":\"${core.getInput('issuer-id')}\", \"key_filepath\": \"${apiKeyPath}\"}`

        const builder = new ArgumentBuilder()
            .Append('pilot', 'upload')
            .Append('--api_key', apiKey)

        process.env['PILOT_IPA'] = core.getInput('app-path')

        core.startGroup('Run fastlane "pilot"')
        await exec.exec('fastlane', builder.Build())
        core.endGroup()
    } catch (ex: any) {
        core.setFailed(ex.message)
    }
}

Run()
