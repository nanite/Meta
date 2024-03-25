import { semver } from "bun";

export function fixMinecraftVersion(version: string) {
    const versionName = version.split('-')[0];
    const parts = versionName.split('.');
    
    // If the parts is less than 3, then we need to pad it out
    if (parts.length < 3) {
        return versionName + '.0';
    }

    return versionName;
}

export function semverSortMinecraft(a: string, b: string) {
    const fixedA = fixMinecraftVersion(a);
    const fixedB = fixMinecraftVersion(b);

    return semver.order(fixedB, fixedA);
}