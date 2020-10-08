const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const config = getConfig(`${__dirname}/config/popular-content.yaml`)

  const getPopularContent = pagesData => {
    const popularContent = {}

    config.properties.forEach(({ meta_property_name, order }) => {
      popularContent[meta_property_name] = []

      pagesData.forEach(({ meta }) => {
        if (meta[meta_property_name]) {
          popularContent[meta_property_name].push(meta)
        }
      })

      popularContent[meta_property_name].sort((a, b) => {
        if (order && order === 'desc') {
          return b[meta_property_name] - a[meta_property_name]
        }
        return a[meta_property_name] - b[meta_property_name]
      })
    })

    return popularContent
  }

  const getAppData = data => {
    if (data.app !== null && typeof data.app === 'object') {
      return Object.assign({}, data.app, {
        popularContent: getPopularContent(data.pagesData)
      })
    }

    return data.app
  }

  return {
    getAppData
  }
})()
