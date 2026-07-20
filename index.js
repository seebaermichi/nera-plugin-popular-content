import { getConfig } from '@nera-static/plugin-utils'
import path from 'path'

export function getAppData(data) {
    // Read config inside the hook so edits are picked up without a restart and
    // tests can point at a temporary cwd.
    const config = getConfig(
        path.resolve(process.cwd(), 'config/popular-content.yaml')
    )

    // Always hand back a complete app object with `popularContent` present.
    // Returning null here used to make the generator reject the result with
    // "returned invalid format", leaving app.popularContent undefined — and
    // the shipped templates then died reading a property of undefined. An
    // empty object keeps every template and README example working: the
    // lookups simply come back undefined and render nothing.
    if (!config?.properties?.length) {
        return {
            ...data.app,
            popularContent: {},
            popularContentProperties: [],
        }
    }

    const popularContent = {}
    const popularContentProperties = []

    config.properties.forEach(({ meta_property_name, order = 'asc' }) => {
        if (!meta_property_name) {
            console.warn(
                '[Popular Content Plugin] meta_property_name is required for each property'
            )
            return
        }

        popularContentProperties.push(meta_property_name)
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

    return {
        ...data.app,
        popularContent,
        // The configured names, in order. Lets a template resolve the right
        // key when the user has renamed meta_property_name — the shipped
        // templates would otherwise silently read a name that no longer exists.
        popularContentProperties,
    }
}
