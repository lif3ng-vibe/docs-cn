// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/experimental/icon-set-files`: every field of the
 * files an icon set is made of (the descriptor, the data file, and an icon
 * definition), one section each. Experimental (spec:AST-017 FR27): built
 * from the experimental authoring self-docs, which stable `astryx docs
 * authoring` never lists.
 */

import {buildExperimentalAuthoringSections} from '../../../foundation/discovery/authoring-self-docs.mjs';

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'icon-set-files',
  placement: {parent: 'namespace:experimental', slot: 'guides', order: 15},
  stability: 'experimental',
  title: '图标集文件',
  category: 'guide',
  keywords: [
    '图标集文档',
    'icons.json',
    '图标集数据',
    '图标定义文档',
    'IconSetDoc',
    'IconSetData',
    'IconDefinitionDoc',
  ],
  description:
    '图标集所由构成的每个文件的每个字段：描述符、数据文件与图标定义。',
  sections: await buildExperimentalAuthoringSections(),
};
