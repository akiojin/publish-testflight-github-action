import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ArgumentBuilder } from '@akiojin/argument-builder';
import * as fs from 'fs/promises';

async function Run()
{
    try {
        const APIKeyPath = core.getInput('api-key-path') || './api-key.p8'

        if (core.getInput('api-key') != null) {
            await fs.writeFile(APIKeyPath, Buffer.from(core.getInput('api-key')))
        }

        const builder = new ArgumentBuilder()
            .Append('pilot', 'upload')
            .Append('--ipa', core.getInput('ipa-path'))
            .Append('--api_key', JSON.stringify({
                "key_id": core.getInput('key-id'),
                "issuer_id": core.getInput('issuer-id'),
                "key_filepath": APIKeyPath
            }))

        core.startGroup('Run fastlane "pilot"')
        await exec.exec('fastlane', builder.Build())
        core.endGroup()
    } catch (ex: any) {
        core.setFailed(ex.message)
    }
}

Run()
