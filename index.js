const moment = require('moment')

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const getProperties = (meta, properties) => {
    const propertiesObject = {}

    properties.forEach(property => {
      if (meta[property]) {
        propertiesObject[property] = meta[property]
      }
    })

    return propertiesObject
  }

  const getPopularContent = pagesData => {
    const config = getConfig(`${__dirname}/config/popular-content.yaml`)
    const popularContent = {}

    config.collection.forEach(({ meta_property_name, display_meta_properties, order }) => {
      pagesData.forEach(({ meta }) => {
        if (meta[meta_property_name]) {
          const properties = [meta_property_name, ...display_meta_properties]

          if (!popularContent[meta_property_name]) {
            popularContent[meta_property_name] = []
          }

          popularContent[meta_property_name].push(getProperties(meta, properties))

          popularContent[meta_property_name].sort((a, b) => {
            if (order && order === 'desc') {
              return b[meta_property_name] - a[meta_property_name]
            }
            return a[meta_property_name] - b[meta_property_name]
          })
        }
      })
    })

    return popularContent
  }

  const getAppData = data => {
    if (data.app !== null && typeof data.app === 'object') {
      return Object.assign({}, data.app, {
        popularContent: getPopularContent(data.pagesData),
        fromNow: createdAt => moment(createdAt).fromNow()
      })
    }

    return data.app
  }

  return {
    getAppData
  }
})()
