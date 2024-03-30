import { Ad, Collection } from "./database"

export function pause(delay = 500) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

export function compareCollection(src: Collection<Ad>, updates: Collection<Ad> ): string[] {
    return Object.keys(updates).filter(key => !src[key])
}
