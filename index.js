const moment = require('moment')

const { getConfig } = require('../plugin-helper')

module.exports = (() => {
  const getPopularContent = pagesData => {
    const config = getConfig(`${__dirname}/config/popular-content.yaml`)
    const popularContent = []

    pagesData.forEach(({ meta }) => {
      if (meta[config.meta_property_name]) {
        popularContent.push({
          createdAt: moment(meta.createdAt).fromNow(),
          // image: meta.unsplash_image_id || false,
          href: meta.htmlPathName,
          position: meta[config.meta_property_name],
          title: meta.title
        })
      }
    })

    return popularContent.sort((a, b) => a.position - b.position)
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
