import { SystemInputEnum } from '../app';
import { TaskResponseKeyEnum } from '../chat';
import {
  FlowModuleTypeEnum,
  FlowInputItemTypeEnum,
  FlowOutputItemTypeEnum,
  SpecialInputKeyEnum
} from './index';
import type { AppItemType } from '@/types/app';
import type { FlowModuleTemplateType } from '@/types/flow';
import { chatModelList } from '@/store/static';
import {
  Input_Template_History,
  Input_Template_TFSwitch,
  Input_Template_UserChatInput
} from './inputTemplate';

export const ChatModelSystemTip =
  '模型固定的引导词，通过调整该内容，可以引导模型聊天方向。该内容会被固定在上下文的开头。可使用变量，例如 {{language}}';
export const ChatModelLimitTip =
  '限定模型对话范围，会被放置在本次提问前，拥有强引导和限定性。可使用变量，例如 {{language}}。引导例子:\n1. 知识库是关于 Laf 的介绍，参考知识库回答问题，与 "Laf" 无关内容，直接回复: "我不知道"。\n2. 你仅回答关于 "xxx" 的问题，其他问题回复: "xxxx"';
export const userGuideTip = '可以添加特殊的对话前后引导模块，更好的让用户进行对话';
export const welcomeTextTip =
  '每次对话开始前，发送一个初始内容。支持标准 Markdown 语法，可使用的额外标记:\n[快捷按键]: 用户点击后可以直接发送该问题';

export const VariableModule: FlowModuleTemplateType = {
  logo: '/imgs/module/variable.png',
  name: '全局变量',
  intro: '可以在对话开始前，要求用户填写一些内容作为本轮对话的变量。该模块位于开场引导之后。',
  description:
    '全局变量可以通过 {{变量key}} 的形式注入到其他模块的文本中。目前支持：提示词、限定词。',
  flowType: FlowModuleTypeEnum.variable,
  inputs: [
    {
      key: SystemInputEnum.variables,
      type: FlowInputItemTypeEnum.systemInput,
      label: '变量输入',
      value: []
    }
  ],
  outputs: []
};
export const UserGuideModule: FlowModuleTemplateType = {
  logo: '/imgs/module/userGuide.png',
  name: '用户引导',
  intro: userGuideTip,
  flowType: FlowModuleTypeEnum.userGuide,
  inputs: [
    {
      key: SystemInputEnum.welcomeText,
      type: FlowInputItemTypeEnum.input,
      label: '开场白'
    }
  ],
  outputs: []
};
export const UserInputModule: FlowModuleTemplateType = {
  logo: '/imgs/module/userChatInput.png',
  name: '用户问题',
  intro: '用户输入的内容。该模块通常作为应用的入口，用户在发送消息后会首先执行该模块。',
  flowType: FlowModuleTypeEnum.questionInput,
  url: '/app/modules/init/userChatInput',
  inputs: [
    {
      key: SystemInputEnum.userChatInput,
      type: FlowInputItemTypeEnum.systemInput,
      label: '用户问题'
    }
  ],
  outputs: [
    {
      key: SystemInputEnum.userChatInput,
      label: '用户问题',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};
export const HistoryModule: FlowModuleTemplateType = {
  logo: '/imgs/module/history.png',
  name: '聊天记录',
  intro: '用户输入的内容。该模块通常作为应用的入口，用户在发送消息后会首先执行该模块。',
  flowType: FlowModuleTypeEnum.historyNode,
  url: '/app/modules/init/history',
  inputs: [
    {
      key: 'maxContext',
      type: FlowInputItemTypeEnum.numberInput,
      label: '最长记录数',
      value: 6,
      min: 0,
      max: 50
    },
    {
      key: SystemInputEnum.history,
      type: FlowInputItemTypeEnum.hidden,
      label: '聊天记录'
    }
  ],
  outputs: [
    {
      key: SystemInputEnum.history,
      label: '聊天记录',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};

const defaultModel = chatModelList[0];
export const ChatModule: FlowModuleTemplateType = {
  logo: '/imgs/module/AI.png',
  name: 'AI 对话',
  intro: 'AI 大模型对话',
  flowType: FlowModuleTypeEnum.chatNode,
  url: '/app/modules/chat/gpt',
  inputs: [
    {
      key: 'model',
      type: FlowInputItemTypeEnum.custom,
      label: '对话模型',
      value: defaultModel?.model,
      list: chatModelList.map((item) => ({ label: item.name, value: item.model }))
    },
    {
      key: 'temperature',
      type: FlowInputItemTypeEnum.slider,
      label: '温度',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      markList: [
        { label: '严谨', value: 0 },
        { label: '发散', value: 10 }
      ]
    },
    {
      key: 'maxToken',
      type: FlowInputItemTypeEnum.custom,
      label: '回复上限',
      value: defaultModel ? defaultModel.contextMaxToken / 2 : 2000,
      min: 100,
      max: defaultModel?.contextMaxToken || 4000,
      step: 50,
      markList: [
        { label: '100', value: 100 },
        {
          label: `${defaultModel?.contextMaxToken || 4000}`,
          value: defaultModel?.contextMaxToken || 4000
        }
      ]
    },
    {
      key: 'systemPrompt',
      type: FlowInputItemTypeEnum.textarea,
      label: '系统提示词',
      description: ChatModelSystemTip,
      placeholder: ChatModelSystemTip,
      value: ''
    },
    {
      key: 'limitPrompt',
      type: FlowInputItemTypeEnum.textarea,
      label: '限定词',
      description: ChatModelLimitTip,
      placeholder: ChatModelLimitTip,
      value: ''
    },
    Input_Template_TFSwitch,
    {
      key: 'quoteQA',
      type: FlowInputItemTypeEnum.target,
      label: '引用内容'
    },
    Input_Template_History,
    Input_Template_UserChatInput
  ],
  outputs: [
    {
      key: TaskResponseKeyEnum.answerText,
      label: '模型回复',
      description: '直接响应，无需配置',
      type: FlowOutputItemTypeEnum.hidden,
      targets: []
    }
  ]
};

export const KBSearchModule: FlowModuleTemplateType = {
  logo: '/imgs/module/db.png',
  name: '知识库搜索',
  intro: '去知识库中搜索对应的答案。可作为 AI 对话引用参考。',
  flowType: FlowModuleTypeEnum.kbSearchNode,
  url: '/app/modules/kb/search',
  inputs: [
    {
      key: 'kbList',
      type: FlowInputItemTypeEnum.custom,
      label: '关联的知识库',
      value: [],
      list: []
    },
    {
      key: 'similarity',
      type: FlowInputItemTypeEnum.slider,
      label: '相似度',
      value: 0.8,
      min: 0,
      max: 1,
      step: 0.01,
      markList: [
        { label: '100', value: 100 },
        { label: '1', value: 1 }
      ]
    },
    {
      key: 'limit',
      type: FlowInputItemTypeEnum.slider,
      label: '单次搜索上限',
      description: '最多取 n 条记录作为本次问题引用',
      value: 5,
      min: 1,
      max: 20,
      step: 1,
      markList: [
        { label: '1', value: 1 },
        { label: '20', value: 20 }
      ]
    },
    Input_Template_TFSwitch,
    Input_Template_UserChatInput
  ],
  outputs: [
    {
      key: 'isEmpty',
      label: '搜索结果为空',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    },
    {
      key: 'unEmpty',
      label: '搜索结果不为空',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    },
    {
      key: 'quoteQA',
      label: '引用内容',
      description: '搜索结果为空时不返回',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};

export const AnswerModule: FlowModuleTemplateType = {
  logo: '/imgs/module/reply.png',
  name: '指定回复',
  intro: '该模块可以直接回复一段指定的内容。常用于引导、提示。',
  flowType: FlowModuleTypeEnum.answerNode,
  inputs: [
    Input_Template_TFSwitch,
    {
      key: SpecialInputKeyEnum.answerText,
      value: '',
      type: FlowInputItemTypeEnum.textarea,
      label: '回复的内容'
    }
  ],
  outputs: []
};
export const TFSwitchModule: FlowModuleTemplateType = {
  logo: '',
  name: 'TF开关',
  intro: '可以判断输入的内容为 True 或者 False，从而执行不同操作。',
  flowType: FlowModuleTypeEnum.tfSwitchNode,
  inputs: [
    {
      key: SystemInputEnum.switch,
      type: FlowInputItemTypeEnum.target,
      label: '输入'
    }
  ],
  outputs: [
    {
      key: 'true',
      label: 'True',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    },
    {
      key: 'false',
      label: 'False',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};
export const ClassifyQuestionModule: FlowModuleTemplateType = {
  logo: '/imgs/module/cq.png',
  name: '问题分类',
  intro: '可以判断用户问题属于哪方面问题，从而执行不同的操作。',
  description:
    '根据用户的历史记录和当前问题判断该次提问的类型。可以添加多组问题类型，下面是一个模板例子：\n类型1: 打招呼\n类型2: 关于 laf 通用问题\n类型3: 关于 laf 代码问题\n类型4: 其他问题',
  url: '/app/modules/agent/classifyQuestion',
  flowType: FlowModuleTypeEnum.classifyQuestion,
  inputs: [
    {
      key: 'systemPrompt',
      type: FlowInputItemTypeEnum.textarea,
      label: '系统提示词',
      description:
        '你可以添加一些特定内容的介绍，从而更好的识别用户的问题类型。这个内容通常是给模型介绍一个它不知道的内容。',
      placeholder: '例如: \n1. Laf 是一个云函数开发平台……\n2. Sealos 是一个集群操作系统',
      value: ''
    },
    Input_Template_History,
    Input_Template_UserChatInput,
    {
      key: 'agents',
      type: FlowInputItemTypeEnum.custom,
      label: '',
      value: [
        {
          value: '打招呼',
          key: 'fasw'
        },
        {
          value: '关于 xxx 的问题',
          key: 'fqsw'
        },
        {
          value: '其他问题',
          key: 'fesw'
        }
      ]
    }
  ],
  outputs: [
    {
      key: 'fasw',
      label: '',
      type: FlowOutputItemTypeEnum.hidden,
      targets: []
    },
    {
      key: 'fqsw',
      label: '',
      type: FlowOutputItemTypeEnum.hidden,
      targets: []
    },
    {
      key: 'fesw',
      label: '',
      type: FlowOutputItemTypeEnum.hidden,
      targets: []
    }
  ]
};
export const EmptyModule: FlowModuleTemplateType = {
  logo: '/imgs/module/cq.png',
  name: '该模块已被移除',
  intro: '',
  description: '',
  flowType: FlowModuleTypeEnum.empty,
  inputs: [],
  outputs: []
};

export const ModuleTemplates = [
  {
    label: '输入模块',
    list: [UserInputModule, HistoryModule, VariableModule, UserGuideModule]
  },
  {
    label: '内容生成',
    list: [ChatModule, AnswerModule]
  },
  {
    label: '知识库模块',
    list: [KBSearchModule]
  },
  {
    label: 'Agent',
    list: [ClassifyQuestionModule]
  }
];
export const ModuleTemplatesFlat = ModuleTemplates.map((templates) => templates.list)?.flat();

// template
export const appTemplates: (AppItemType & { avatar: string; intro: string })[] = [
  {
    id: 'simpleChat',
    avatar: '/imgs/module/AI.png',
    name: '简单的对话',
    intro: '一个极其简单的 AI 对话应用',
    modules: [
      {
        moduleId: 'userChatInput',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        flowType: 'questionInput',
        inputs: [
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'history',
        position: {
          x: 452.5466249541586,
          y: 1276.3930310334215
        },
        flowType: 'historyNode',
        inputs: [
          {
            key: 'maxContext',
            value: 10,
            connected: true
          },
          {
            key: 'history',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'chatModule',
        position: {
          x: 981.9682828103937,
          y: 890.014595014464
        },
        flowType: 'chatNode',
        inputs: [
          {
            key: 'model',
            value: 'gpt-3.5-turbo-16k',
            connected: true
          },
          {
            key: 'temperature',
            value: 0,
            connected: true
          },
          {
            key: 'maxToken',
            value: 8000,
            connected: true
          },
          {
            key: 'systemPrompt',
            value: '',
            connected: true
          },
          {
            key: 'limitPrompt',
            value: '',
            connected: true
          },
          {
            key: 'switch',
            connected: false
          },
          {
            key: 'quoteQA',
            connected: false
          },
          {
            key: 'history',
            connected: true
          },
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            targets: []
          }
        ]
      }
    ]
  },
  {
    id: 'simpleKbChat',
    avatar: '/imgs/module/db.png',
    name: '知识库 + 对话引导',
    intro: '每次提问时进行一次知识库搜索，将搜索结果注入 LLM 模型进行参考回答',
    modules: [
      {
        moduleId: 'userGuide',
        position: {
          x: 447.98520778293346,
          y: 721.4016845336229
        },
        flowType: 'userGuide',
        inputs: [
          {
            key: 'welcomeText',
            value:
              '我是 laf 助手，请问有什么可以帮助你的么？\n[laf 是什么？]\n[laf 官网是多少？]\n[交流群]',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'userChatInput',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        flowType: 'questionInput',
        inputs: [
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'userChatInput'
              },
              {
                moduleId: 'kbSearch',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'history',
        position: {
          x: 458.37518916304566,
          y: 1296.7930057645262
        },
        flowType: 'historyNode',
        inputs: [
          {
            key: 'maxContext',
            value: 10,
            connected: true
          },
          {
            key: 'history',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'kbSearch',
        position: {
          x: 956.0838440206068,
          y: 887.462827870246
        },
        flowType: 'kbSearchNode',
        inputs: [
          {
            key: 'kbList',
            value: [],
            connected: true
          },
          {
            key: 'similarity',
            value: 0.82,
            connected: true
          },
          {
            key: 'limit',
            value: 5,
            connected: true
          },
          {
            key: 'switch',
            connected: false
          },
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'isEmpty',
            targets: [
              {
                moduleId: 'asv5cb',
                key: 'switch'
              }
            ]
          },
          {
            key: 'unEmpty',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'switch'
              }
            ]
          },
          {
            key: 'quoteQA',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'quoteQA'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'chatModule',
        position: {
          x: 1521.114092861523,
          y: 1038.6910820851604
        },
        flowType: 'chatNode',
        inputs: [
          {
            key: 'model',
            value: 'gpt-3.5-turbo-16k',
            connected: true
          },
          {
            key: 'temperature',
            value: 5,
            connected: true
          },
          {
            key: 'maxToken',
            value: 16000,
            connected: true
          },
          {
            key: 'systemPrompt',
            value: '知识库是关于 laf 的内容。',
            connected: true
          },
          {
            key: 'limitPrompt',
            value: '根据知识库回答用户问题，回答范围仅限知识库。',
            connected: true
          },
          {
            key: 'switch',
            connected: true
          },
          {
            key: 'quoteQA',
            connected: true
          },
          {
            key: 'history',
            connected: true
          },
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            targets: []
          }
        ]
      },
      {
        moduleId: 'asv5cb',
        position: {
          x: 1517.320542832093,
          y: 699.8757371712562
        },
        flowType: 'answerNode',
        inputs: [
          {
            key: 'switch',
            connected: true
          },
          {
            key: 'text',
            value: '对不起，我找不到你的问题，请更加详细的描述 laf 相关的问题。',
            connected: true
          }
        ],
        outputs: []
      }
    ]
  },
  {
    id: 'chatGuide',
    avatar: '/imgs/module/userGuide.png',
    name: '对话引导 + 变量',
    intro: '可以在对话开始发送一段提示，或者让用户填写一些内容，作为本次对话的变量',
    modules: [
      {
        moduleId: 'userGuide',
        position: {
          x: 447.98520778293346,
          y: 721.4016845336229
        },
        flowType: 'userGuide',
        inputs: [
          {
            key: 'welcomeText',
            value:
              '你好，我是翻译助手，可以帮你把内容翻译成任何语言，请告诉我，你需要翻译成什么语言？',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'userChatInput',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        flowType: 'questionInput',
        inputs: [
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'history',
        position: {
          x: 452.5466249541586,
          y: 1276.3930310334215
        },
        flowType: 'historyNode',
        inputs: [
          {
            key: 'maxContext',
            value: 10,
            connected: true
          },
          {
            key: 'history',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'chatModule',
        position: {
          x: 981.9682828103937,
          y: 890.014595014464
        },
        flowType: 'chatNode',
        inputs: [
          {
            key: 'model',
            value: 'gpt-3.5-turbo-16k',
            connected: true
          },
          {
            key: 'temperature',
            value: 0,
            connected: true
          },
          {
            key: 'maxToken',
            value: 8000,
            connected: true
          },
          {
            key: 'systemPrompt',
            value: '',
            connected: true
          },
          {
            key: 'limitPrompt',
            value: '把用户发送的内容直接翻译成{{language}}，不要做其他回答。',
            connected: true
          },
          {
            key: 'switch',
            connected: false
          },
          {
            key: 'quoteQA',
            connected: false
          },
          {
            key: 'history',
            connected: true
          },
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            targets: []
          }
        ]
      },
      {
        moduleId: 'fo9i68',
        position: {
          x: 445.17843864558927,
          y: 992.4891333735476
        },
        flowType: 'variable',
        inputs: [
          {
            key: 'variables',
            value: [
              {
                id: '9qjnai',
                key: 'language',
                label: '目标语言',
                type: 'input',
                required: true,
                maxLen: 50,
                enums: [
                  {
                    value: ''
                  }
                ]
              }
            ],
            connected: true
          }
        ],
        outputs: []
      }
    ]
  },
  {
    id: 'CQ',
    avatar: '/imgs/module/cq.png',
    name: '问题分类 + 知识库',
    intro: '先对用户的问题进行分类，再根据不同类型问题，执行不同的操作',
    modules: [
      {
        moduleId: '7z5g5h',
        position: {
          x: 198.56612928723575,
          y: 1622.7034463081607
        },
        flowType: 'questionInput',
        inputs: [
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            targets: [
              {
                moduleId: 'remuj3',
                key: 'userChatInput'
              },
              {
                moduleId: 'nlfwkc',
                key: 'userChatInput'
              },
              {
                moduleId: 'fljhzy',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'xj0c9p',
        position: {
          x: 194.99102398958047,
          y: 1801.3545999721096
        },
        flowType: 'historyNode',
        inputs: [
          {
            key: 'maxContext',
            value: 10,
            connected: true
          },
          {
            key: 'history',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            targets: [
              {
                moduleId: 'nlfwkc',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'remuj3',
        position: {
          x: 672.9092284362648,
          y: 1077.557793775116
        },
        flowType: 'classifyQuestion',
        inputs: [
          {
            key: 'systemPrompt',
            value:
              'laf 是云开发平台，可以快速的开发应用\nlaf 是一个开源的 BaaS 开发平台（Backend as a Service)\nlaf 是一个开箱即用的 serverless 开发平台\nlaf 是一个集「函数计算」、「数据库」、「对象存储」等于一身的一站式开发平台\nlaf 可以是开源版的腾讯云开发、开源版的 Google Firebase、开源版的 UniCloud',
            connected: true
          },
          {
            key: 'history',
            connected: true
          },
          {
            key: 'userChatInput',
            connected: true
          },
          {
            key: 'agents',
            value: [
              {
                value: '打招呼、问候等问题',
                key: 'fasw'
              },
              {
                value: '“laf” 的问题',
                key: 'fqsw'
              },
              {
                value: '其他问题',
                key: 'fesw'
              }
            ],
            connected: true
          }
        ],
        outputs: [
          {
            key: 'fasw',
            targets: [
              {
                moduleId: 'a99p6z',
                key: 'switch'
              }
            ]
          },
          {
            key: 'fqsw',
            targets: [
              {
                moduleId: 'fljhzy',
                key: 'switch'
              }
            ]
          },
          {
            key: 'fesw',
            targets: [
              {
                moduleId: 'iejcou',
                key: 'switch'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'a99p6z',
        position: {
          x: 1304.2886011902247,
          y: 776.1589509539264
        },
        flowType: 'answerNode',
        inputs: [
          {
            key: 'switch',
            connected: true
          },
          {
            key: 'text',
            value: '你好，我是 laf 助手，有什么可以帮助你的？',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'iejcou',
        position: {
          x: 1301.7531189034548,
          y: 1842.1297123368286
        },
        flowType: 'answerNode',
        inputs: [
          {
            key: 'switch',
            connected: true
          },
          {
            key: 'text',
            value: '你好，我仅能回答 laf 相关问题，请问你有什么问题么？',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'nlfwkc',
        position: {
          x: 1821.979893659983,
          y: 1104.6583548423682
        },
        flowType: 'chatNode',
        inputs: [
          {
            key: 'model',
            value: 'gpt-3.5-turbo-16k',
            connected: true
          },
          {
            key: 'temperature',
            value: 0,
            connected: true
          },
          {
            key: 'maxToken',
            value: 8000,
            connected: true
          },
          {
            key: 'systemPrompt',
            value: '知识库是关于 laf 的内容。',
            connected: true
          },
          {
            key: 'limitPrompt',
            value:
              '我的问题都是关于 laf 的。根据知识库回答我的问题，与 laf 无关问题，直接回复：“我不清楚，我仅能回答 laf 相关的问题。”。',
            connected: true
          },
          {
            key: 'switch',
            connected: true
          },
          {
            key: 'quoteQA',
            connected: true
          },
          {
            key: 'history',
            connected: true
          },
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            targets: []
          }
        ]
      },
      {
        moduleId: 's4v9su',
        position: {
          x: 193.3803955457983,
          y: 1116.251200765746
        },
        flowType: 'historyNode',
        inputs: [
          {
            key: 'maxContext',
            value: 2,
            connected: true
          },
          {
            key: 'history',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            targets: [
              {
                moduleId: 'remuj3',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'fljhzy',
        position: {
          x: 1305.5374262228029,
          y: 1120.0404921820218
        },
        flowType: 'kbSearchNode',
        inputs: [
          {
            key: 'kbList',
            value: [],
            connected: true
          },
          {
            key: 'similarity',
            value: 0.76,
            connected: true
          },
          {
            key: 'limit',
            value: 5,
            connected: true
          },
          {
            key: 'switch',
            connected: true
          },
          {
            key: 'userChatInput',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'isEmpty',
            targets: [
              {
                moduleId: 'tc90wz',
                key: 'switch'
              }
            ]
          },
          {
            key: 'unEmpty',
            targets: [
              {
                moduleId: 'nlfwkc',
                key: 'switch'
              }
            ]
          },
          {
            key: 'quoteQA',
            targets: [
              {
                moduleId: 'nlfwkc',
                key: 'quoteQA'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'q9equb',
        position: {
          x: 191.4857498376603,
          y: 856.6847387508401
        },
        flowType: 'userGuide',
        inputs: [
          {
            key: 'welcomeText',
            value:
              '你好，我是 laf 助手，有什么可以帮助你的？\n[laf 是什么？有什么用？]\n[laf 在线体验地址]\n[官网地址是多少]',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'tc90wz',
        position: {
          x: 1828.4596416688908,
          y: 765.3628156185887
        },
        flowType: 'answerNode',
        inputs: [
          {
            key: 'switch',
            connected: true
          },
          {
            key: 'text',
            value: '对不起，我找不到你的问题，请更加详细的描述你的问题。',
            connected: true
          }
        ],
        outputs: []
      }
    ]
  }
];