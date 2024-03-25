import {MetaSpec2} from './MetaSpec2'

export interface EnrichedMetaSpec extends MetaSpec2 {
    modrinth: CommonProvider | null;
    curseforge: CommonProvider | null;
}

export interface CommonProvider {
    image?: string;
    title: string;
    description: string;
    webUrl: string;
    minecraftVersions: string[];
    updatedAt: string;
    downloads: number;
}