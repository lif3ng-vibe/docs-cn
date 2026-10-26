# 目录结构

新增提供商（provider）时，需要为该提供商创建一个目录，目录结构如下：

```
litellm/llms/
└── provider_name/
    ├── completion/ # use when endpoint is equivalent to openai's `/v1/completions`
    │   ├── handler.py
    │   └── transformation.py
    ├── chat/ # use when endpoint is equivalent to openai's `/v1/chat/completions`
    │   ├── handler.py
    │   └── transformation.py
    ├── embed/ # use when endpoint is equivalent to openai's `/v1/embeddings`
    │   ├── handler.py
    │   └── transformation.py
    ├── audio_transcription/ # use when endpoint is equivalent to openai's `/v1/audio/transcriptions`
    │   ├── handler.py
    │   └── transformation.py
    └── rerank/ # use when endpoint is equivalent to cohere's `/rerank` endpoint.
        ├── handler.py
        └── transformation.py
```
