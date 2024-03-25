import { CommonProvider } from "../types/EnrichedMetaSpec";
import { semverSortMinecraft } from "../utils";

const url = `https://api.curseforge.com/v1/`;

export async function getCurseProjectData(id: string): Promise<CommonProvider | null> {
    const modRequest = await fetcher(`${url}mods/${id}`);

    if (modRequest.status !== 200) {
        console.log(`Failed to fetch Curse data for ${id} due to a status code of ${modRequest.status}`)
        return null;
    }

    let modData: any = await modRequest.json();
    if (!modData?.data?.slug) {
        console.log(`No slug found for Curse project ${id}`);
        return null;
    }

    modData = modData.data;

    return {
        title: modData.name,
        description: modData.summary,
        image: modData.logo?.url ?? null,
        minecraftVersions: ([...new Set(modData.latestFilesIndexes.map((e: any) => e.gameVersion))] as string[])
            .sort(semverSortMinecraft),
        webUrl: modData.links?.websiteUrl ?? `https://www.curseforge.com/minecraft/mc-mods/${modData.slug}`,
        updatedAt: modData.dateModified,
        downloads: modData.downloadCount,
    }
}

async function fetcher(request: string | URL | Request, init?: RequestInit): Promise<Response> {
    return fetch(request, {
        ...init,
        headers: {
            ...init?.headers,
            'Accept':'application/json',
            'x-api-key': process.env.CURSEFORGE_TOKEN ?? "",
        },
    });
}
