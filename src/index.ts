import { Octokit } from '@octokit/rest';
import { MetaSpec2 } from './types/MetaSpec2';
import { EnrichedMetaSpec } from './types/EnrichedMetaSpec';
import { getCurseProjectData } from './fetchers/CurseDataFetcher';
import { getModrinthData } from './fetchers/ModrinthDataFetcher';
import fs from 'node:fs'
import { nameRemapper } from './nameRemapper';

const octokit = new Octokit({
    auth: process.env.GH_TOKEN,
});

// Get all the repos in the org that are public
const reposReq = await octokit.repos.listForOrg({
    org: "nanite", 
    type: "public",
});

const repos = reposReq.data;

type RepoData = typeof repos[0];

// Go over each repo and try and find the meta file from the .github/meta.json
const validSpecs: {
    repo: RepoData;
    meta: MetaSpec2;
}[] = [];

const naniteMembersReq = await octokit.orgs.listMembers({
    org: "nanite",
});

const naniteMembers: any[] = [];
for (const member of naniteMembersReq.data) {
    if (member.login === "NaniteBot") {
        continue;
    }

    naniteMembers.push({
        name: nameRemapper[member.login] ?? member.login,
        url: member.html_url,
        avatar: member.avatar_url,
    });
}

for (const repo of repos) {
    const repoName = repo.name;
    console.log(`Checking repo: ${repoName}`);

    if (repoName !== "Simple-Discord-Rich-Presence") {
        continue;
    }

    try {
        const metaFile = await octokit.repos.getContent({
            owner: "nanite",
            repo: repoName,
            path: ".github/meta.json",
        });
    
        // If the file is found, then we can parse it and do something with it
        if (metaFile) {
            // Decode from base64
            const meta = JSON.parse(Buffer.from((metaFile.data as any).content, 'base64').toString('utf-8'));
            if (!meta?.spec) {
                console.log(`No spec found for ${repoName}`);
                continue;
            }

            validSpecs.push({
                repo,
                meta,
            });
        }
    } catch (e) {
        console.log(`No meta file found for ${repoName}`);
    }
}

// Now we have all the valid specs, we can do something with them
const finalSpecData: (EnrichedMetaSpec & {
    name: string;
    repo: string;
})[] = [];

for (const {repo, meta} of validSpecs) {
    const curseData = meta.providers.find(p => p.name.toLowerCase() === "curseforge");
    const modrinthData = meta.providers.find(p => p.name.toLowerCase() === "modrinth");
    
    let curseProjectData = null;
    if (curseData && curseData.type === "identity") {
        curseProjectData = await getCurseProjectData(curseData.id);
    }

    let modrithinProjectData = null;
    if (modrinthData && modrinthData.type === "identity") {
        modrithinProjectData = await getModrinthData(modrinthData.id);
    }

    finalSpecData.push({
        name: repo.name,
        repo: repo.html_url,
        ...meta,
        curseforge: curseProjectData,
        modrinth: modrithinProjectData,
    });
}

// Update or create a data/projects.json file with the final data
if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

Bun.write("data/combined.json", JSON.stringify({
    projects: finalSpecData,
    members: naniteMembers,
}, null, 2));

Bun.write("data/projects.json", JSON.stringify({
    finalSpecData,
}, null, 2));

Bun.write("data/members.json", JSON.stringify({
    naniteMembers,
}, null, 2));

