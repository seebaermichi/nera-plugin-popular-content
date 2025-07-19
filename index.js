import { getConfig } from '@nera-static/plugin-utils'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function getAppData(data) {
    const config = getConfig(
        path.resolve(__dirname, 'config/popular-content.yaml')
    )

    if (!config || !config.properties) {
        console.warn(
            '[Popular Content Plugin] No configuration found or invalid config structure'
        )
        return null // Return null to skip merge
    }

    const popularContent = {}

    config.properties.forEach(({ meta_property_name, order = 'asc' }) => {
        if (!meta_property_name) {
            console.warn(
                '[Popular Content Plugin] meta_property_name is required for each property'
            )
            return
        }

        popularContent[meta_property_name] = []

        data.pagesData.forEach(({ meta, content }) => {
            if (meta[meta_property_name] !== undefined) {
                const item = {
                    ...meta,
                    content,
                }
                popularContent[meta_property_name].push(item)
            }
        })

        // Sort by the meta property value
        popularContent[meta_property_name].sort((a, b) => {
            const valueA = a[meta_property_name]
            const valueB = b[meta_property_name]

            if (order === 'desc') {
                return valueB - valueA
            }
            return valueA - valueB
        })
    })

    // Always return complete app data with popularContent added
    return {
        ...data.app,
        popularContent,
    }
}
