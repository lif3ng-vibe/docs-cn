// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Avatar-first annotations',
  displayName: 'Avatar-first annotations',
  description:
    '由调用方定位的评论标记，覆盖在媒体上方或位于内容边距中。每个坐标都映射到标记的逻辑 bottom-start 角。选中的分组最多显示三个参与者圆形（两个 Avatar 加一个省略号），末尾是线程总数与强调色未读点；边距中带未读的标记同样显示该点。其余标记变暗但不禁用；再次激活已选中的标记会清除选择；没有选中任何标记时，所有标记都不会变暗。',
  exampleFor: 'CommentPin',
  isReady: true,
  isShowcase: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['CommentPin', 'Text', 'VStack'],
};
