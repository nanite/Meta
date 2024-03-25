import { CommonProvider } from "../types/EnrichedMetaSpec";
import { semverSortMinecraft } from "../utils";

const modrinthApi = "https://api.modrinth.com/v2/";

export async function getModrinthData(id: string): Promise<CommonProvider | null> {
    const request = await fetch(`${modrinthApi}project/${id}`);
    if (request.status !== 200) {
        console.log(`Failed to fetch Modrinth data for ${id} due to a status code of ${request.status}`)
        return null;
    }

    const data: any = await request.json();
    if (!data?.slug) {
        console.log(`No slug found for Modrinth project ${id}`);
        return null;
    }

    return {
        title: data.title,
        description: data.description,
        image: data.icon_url,
        minecraftVersions: data.game_versions.sort(semverSortMinecraft),
        webUrl: `https://modrinth.com/mod/${data.slug}`,
        updatedAt: data.updated,
        downloads: data.downloads,
    }
}