const { randomUUID } = require('crypto')
const { parseStringPromise } = require('xml2js')
const createNodeHelper = require('gatsby-node-helpers').createNodeHelpers

async function onCreateNode (
  { createNodeId, createContentDigest, node, actions, loadNodeContent },
  configOptions
) {
  const { createNode } = actions
  if (node.internal.mediaType === 'application/xml') {
    const { name } = node
    const content = await loadNodeContent(node)
    const data = await parseStringPromise(content, {
      explicitArray: false,
      explicitRoot: false
    })
    // 1. 构建数据节点对象 allXml
    const { createNodeFactory } = createNodeHelper({
      typePrefix: `Xml${name.replace(/^./, name[0].toUpperCase())}`,
      createNodeId,
      createContentDigest
    })

    // 2. 根据数据节点对象创建节点
    const createNodeObject = createNodeFactory('')
    // Todo: 考虑xml内部组织结构的多样性
    const objs =
      Object.entries(data).length === 1 ? Object.values(data).at(0) : data

    Array.isArray(objs)
      ? objs.forEach(async item => {
          item.id = item.id || item['$']?.id || randomUUID()
          delete item.$
          await createNode(createNodeObject(item))
        })
      : await createNode(createNodeObject(objs))
  }
}

module.exports = {
  onCreateNode
}
