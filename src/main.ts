import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ArgumentBuilder } from '@akiojin/argument-builder';
import * as fs from 'fs/promises';

function GenereteAPIKey(keyID: string, issuerID: string, APIKeyPath: string): string
{
    return `"{\"key_id\": \"${keyID}\", \"issuer_id\":\"${issuerID}\", \"key_filepath\": \"${APIKeyPath}\"}"`
}

async function Run()
{
    try {
        const APIKeyPath = core.getInput('api-key-path') || './api-key.p8'

        if (core.getInput('api-key-base64') != null) {
            await fs.writeFile(APIKeyPath, Buffer.from(core.getInput('api-key-base64'), 'base64'))
        }

        const builder = new ArgumentBuilder()
            .Append('pilot', 'upload')
            .Append('--ipa', core.getInput('app-path'))
            .Append('--api_key', GenereteAPIKey(core.getInput('key-id'), core.getInput('issuer-id'), APIKeyPath))

        core.startGroup('Run fastlane "pilot"')
        await exec.exec('fastlane', builder.Build())
        core.endGroup()
    } catch (ex: any) {
        core.setFailed(ex.message)
    }
}

Run()
