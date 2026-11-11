// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'usePowerSearchConfig',
  displayName: 'usePowerSearchConfig',
  group: 'PowerSearch',
  keywords: [
    'powersearch',
    'search',
    'filter',
    'filters',
    'query builder',
    'table filter',
    'usePowerSearchConfig',
    'createPowerSearchConfig',
    '搜索',
    '过滤',
    '查询构建',
  ],
  params: [
    {
      name: 'definitions',
      type: 'ReadonlyArray<FieldDefinition>',
      description:
        '类型化字段定义（key、type、label、enumValues），用于构建 PowerSearch 的字段与运算符。',
      required: true,
    },
    {
      name: 'configName',
      type: 'string',
      description:
        'PowerSearchConfig 对象的可选名称（默认 "PowerSearchConfig"）。',
      required: false,
    },
  ],
  returns: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description:
        '记忆化的 PowerSearch 配置对象，带字段与类型适配的运算符。',
    },
    {
      name: 'applyFilters',
      type: '<T extends InferData<D>>(filters: ReadonlyArray<PowerSearchFilter>, data: ReadonlyArray<T>) => T[]',
      description:
        '客户端过滤助手，按活跃的 PowerSearch 过滤规则过滤数据集。',
    },
  ],
  usage: {
    description:
      '从类型化字段定义构建并记忆化 PowerSearch 配置，连同用于客户端过滤的 applyFilters 函数一起返回。自动把字段类型（string、number、boolean、date、enum 等）映射到其规范运算符，并提供高效的谓词求值器来过滤数据集。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把字段定义以 as const 声明在组件外或做记忆化，让 usePowerSearchConfig 只在必要时重算。',
      },
      {
        guidance: true,
        description:
          '把返回的 config 传给 PowerSearch，并用 applyFilters 为 Table 或 List 计算过滤后的数据行。',
      },
      {
        guidance: false,
        description:
          '不要在每次渲染时内联重建字段定义而不加 as const 或记忆化。',
      },
    ],
  },
  relatedComponents: ['PowerSearch', 'Table'],
  relatedHooks: ['useTableFilterState', 'useTableFiltering'],
  importPath: '@astryxdesign/core/PowerSearch',
  category: 'utilities',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '从类型化字段定义记忆化 PowerSearch 配置 + 返回 applyFilters 供客户端过滤。自动把类型（string、number、date、enum）映射到规范运算符。',
  paramDescriptions: {
    definitions: '类型化字段定义（key、type、label、enumValues）。',
    configName: '可选配置名（默认 "PowerSearchConfig"）。',
  },
  returnDescriptions: {
    config: '记忆化的 PowerSearchConfig，供 PowerSearch 使用。',
    applyFilters: '按活跃的 PowerSearch 过滤器过滤数据集。',
  },
  usage: {
    description:
      '从字段定义构建记忆化的 PowerSearch 配置与客户端过滤函数。',
    bestPractices: [
      {
        guidance: true,
        description: '用 as const 把定义声明在组件外。',
      },
      {
        guidance: true,
        description:
          '把 config 传给 PowerSearch，用 applyFilters 处理 Table/List 数据。',
      },
      {
        guidance: false,
        description: '不要在每次渲染时内联重建字段定义。',
      },
    ],
  },
};
